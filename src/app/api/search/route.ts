
import { NextRequest, NextResponse } from 'next/server';
import { searchDestinations, getAllDestinations, getNearbyPlaces } from '@/lib/place/destinationApi';
import { blogApi } from '@/lib/blog/blogApi';

// Helper function to normalize strings for matching
const normalize = (str: string | undefined | null): string => {
  if (!str || typeof str !== 'string') return '';
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

// Helper function to parse location-based queries
const parseLocationQuery = (query: string): { searchTerm: string; locationName: string | null } => {
  const keywords = ['gần', 'ở', 'quanh', 'tại'];
  const queryParts = query.split(' ');

  let keywordIndex = -1;
  for (const keyword of keywords) {
    const index = queryParts.findIndex(part => normalize(part) === keyword);
    if (index !== -1) {
      keywordIndex = index;
      break;
    }
  }

  if (keywordIndex !== -1) {
    const searchTerm = queryParts.slice(0, keywordIndex).join(' ');
    const locationName = queryParts.slice(keywordIndex + 1).join(' ');
    return { searchTerm, locationName };
  }

  return { searchTerm: query, locationName: null };
};


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  
  // Common params
  const query = searchParams.get('query') || '';
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  const type = searchParams.get('type'); // 'place', 'blog', or null for all

  // Place-specific filters
  const p_category = searchParams.get('p_category') || '';
  const p_district = searchParams.get('p_district') || '';
  const p_ward = searchParams.get('p_ward') || '';
  const p_rating = searchParams.get('p_rating') || '';

  // Blog-specific filters
  const b_category = searchParams.get('b_category') || '';

  try {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    let destinationResults: any[] = [];
    let blogResults: any[] = [];
    let destinationPagination: any = {};
    let blogPagination: any = {};

    const { searchTerm, locationName } = parseLocationQuery(query);

    const fetchDestinations = async () => {
      if (type && type !== 'place') return;

      // If it's a location-based query, use the new logic
      if (locationName) {
        console.log(`Location query detected: searchTerm="${searchTerm}", locationName="${locationName}"`);
        
        // 1. Geocode locationName by fetching all places
        const allPlacesRes = await getAllDestinations();
        const allPlaces = allPlacesRes?.data?.places || [];
        
        const normalizedLocation = normalize(locationName);
        const matchedPlace = allPlaces.find((p: any) => normalize(p.district).includes(normalizedLocation) || normalize(p.name).includes(normalizedLocation));

        if (matchedPlace && matchedPlace.location) {
          const { coordinates } = matchedPlace.location;
          const [longitude, latitude] = coordinates;
          console.log(`Found coordinates for "${locationName}": [${latitude}, ${longitude}]`);

          // 2. Fetch nearby places
          const nearbyPlacesRes = await getNearbyPlaces(latitude, longitude, 10000); // 10km radius
          let nearbyPlaces = nearbyPlacesRes.data || [];

          // 3. Filter nearby places by searchTerm
          if (searchTerm) {
            const normalizedSearchTerm = normalize(searchTerm);
            nearbyPlaces = nearbyPlaces.filter((p: any) => 
              normalize(p.name).includes(normalizedSearchTerm) ||
              (p.category && normalize(p.category.name).includes(normalizedSearchTerm))
            );
          }
          
          destinationResults = nearbyPlaces.map((item: any) => ({ ...item, type: 'place' }));
          // Note: getNearbyPlaces API doesn't seem to support pagination, so we return all results
          destinationPagination = { total: destinationResults.length, page: 1, limit: destinationResults.length };

        } else {
          // Fallback if location not found
          console.log(`Could not find coordinates for "${locationName}". Falling back to standard search.`);
          const res = await searchDestinations({ query: query, page: pageNum, limit: limitNum });
          destinationResults = res.data?.places?.map((item: any) => ({ ...item, type: 'place' })) || [];
          destinationPagination = res.data?.pagination || {};
        }

      } else {
        // Original search logic
        const placeParams: any = { query: query, page: pageNum, limit: limitNum };
        if (p_category) placeParams.category = p_category;
        if (p_district) placeParams.district = p_district;
        if (p_ward) placeParams.ward = p_ward;
        if (p_rating) placeParams.rating = p_rating;
        const res = await searchDestinations(placeParams);
        destinationResults = res.data?.places?.map((item: any) => ({ ...item, type: 'place' })) || [];
        destinationPagination = res.data?.pagination || {};
      }
    };

    const fetchBlogs = async () => {
      if (!type || type === 'blog') {
        const blogParams: any = { query: query, page: pageNum, limit: limitNum };
        if (b_category) blogParams.category = b_category;
        const res = await blogApi.getBlogs(blogParams);
        blogResults = res.data?.data?.map((item: any) => ({ ...item, type: 'blog' })) || [];
        blogPagination = res.data?.pagination || {};
      }
    };

    await Promise.all([fetchDestinations(), fetchBlogs()]);

    return NextResponse.json({
      destinations: destinationResults,
      blogs: blogResults,
      pagination: {
        destinations: destinationPagination,
        blogs: blogPagination,
      },
    });
  } catch (error) {
    console.error('Failed to fetch search results:', error);
    return NextResponse.json(
      { message: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}