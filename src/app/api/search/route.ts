
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

  try {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    let destinationResults: any[] = [];
    let blogResults: any[] = [];
    let destinationPagination: any = {};
    let blogPagination: any = {};

    const fetchDestinations = async () => {
      if (!type || type === 'place') {
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