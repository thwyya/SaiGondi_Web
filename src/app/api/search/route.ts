import { NextRequest, NextResponse } from 'next/server';
import { searchDestinations } from '@/lib/place/destinationApi';
import { blogApi } from '@/lib/blog/blogApi';

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

  let destinationsRes = { data: [], pagination: {} };
  let blogsRes = { data: [], pagination: {} };

  try {
    if (!type || type === 'place') {
      const placeParams: any = { query, page, limit };
      if (p_category) placeParams.category = p_category;
      if (p_district) placeParams.district = p_district;
      if (p_ward) placeParams.ward = p_ward;
      if (p_rating) placeParams.rating = p_rating;
      destinationsRes = await searchDestinations(placeParams);
    }
    
    if (!type || type === 'blog') {
      const blogParams: any = { query, page, limit };
      if (b_category) blogParams.category = b_category;
      blogsRes = await blogApi.searchBlogs(blogParams);
    }

    const results = {
      destinations: destinationsRes.data || [],
      blogs: blogsRes.data || [],
      pagination: {
        destinations: destinationsRes.pagination,
        blogs: blogsRes.pagination,
      },
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch search results:', error);
    return NextResponse.json(
      { message: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}