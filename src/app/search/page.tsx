'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { searchDestinations, getDestinations } from '@/lib/place/destinationApi';
import { blogApi } from '@/lib/blog/blogApi';
import { categoryApi } from '@/lib/category/categoryApi';
import DestinationCard from '@/components/cards/DestinationCard';
import PostCard from '@/components/PostCard';
import { Destination } from '@/types/destination';
import { Blog } from '@/types/blog';
import { Category } from '@/types/category';
import { FiAlertCircle } from 'react-icons/fi';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBox from '@/components/ui/SearchBox';
import SearchFilter, { FilterState } from '@/components/filters/SearchFilter';

// Define the possible filter types
type FilterType = 'all' | 'destinations' | 'blogs';

// Skeleton component for loading state
const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse border border-[var(--gray-5)]">
    <div className="w-full h-48 bg-[var(--gray-5)]"></div>
    <div className="p-4">
      <div className="h-6 bg-[var(--gray-5)] rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-[var(--gray-5)] rounded w-1/2"></div>
    </div>
  </div>
);

// No results component
const NoResults = ({ query }: { query: string | null }) => (
    <div className="text-center py-16 px-4 bg-[var(--gray-6)] rounded-lg col-span-full">
        <FiAlertCircle className="mx-auto h-12 w-12 text-[var(--gray-3)]" />
        <h3 className="mt-2 text-lg font-medium text-[var(--foreground)]">Không tìm thấy kết quả nào</h3>
        <p className="mt-1 text-sm text-[var(--gray-2)]">
            Chúng tôi không thể tìm thấy bất kỳ kết quả nào cho &quot;{query}&quot;. Hãy thử tìm kiếm khác.
        </p>
    </div>
);

function SearchResults() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const tag = searchParams.get('tag');
  const type = (searchParams.get('type') || 'all') as FilterType;

  const [results, setResults] = useState<{ destinations: Destination[], blogs: Blog[] }>({ destinations: [], blogs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterType>(type);
  const [blogCategories, setBlogCategories] = useState<Category[]>([]);
  const [placeCategories, setPlaceCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filters: Partial<FilterState> = useMemo(() => ({
    blogSort: searchParams.get('blogSort') || undefined,
    blogCategory: searchParams.get('blogCategory') || undefined,
    destRating: searchParams.get('destRating') || undefined,
    destWard: searchParams.get('destWard') || undefined,
    placeCategory: searchParams.get('placeCategory') || undefined,
  }), [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allCategories = await categoryApi.getAllCategories();
        setBlogCategories(allCategories.filter((c: Category) => c.type === 'blog'));
        setPlaceCategories(allCategories.filter((c: Category) => c.type === 'place'));
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
            params.set(key, value as string);
        } else {
            params.delete(key);
        }
    });

    const type = params.get('type');
    if (type) {
        params.delete('type');
        params.set('type', type);
    }

    router.push(`${pathname}?${params.toString()}`);
}, [searchParams, router, pathname]);

  useEffect(() => {
    const validTypes: FilterType[] = ['all', 'destinations', 'blogs'];
    if (validTypes.includes(type)) {
        setActiveTab(type);
    } else {
        setActiveTab('all');
    }
  }, [type]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build Destination Params
        const destParams: any = { limit: 200 };
        if (filters.destWard) destParams.ward = filters.destWard;
        if (filters.placeCategory) destParams.category = filters.placeCategory;
        if (filters.destRating) destParams.minRating = parseFloat(filters.destRating);

        // Build Blog Params
        const blogParams: any = { limit: 200 };
        if (tag) blogParams.tag = tag;
        if (filters.blogCategory) blogParams.category = filters.blogCategory;
        if (filters.blogSort) {
            const [sort, order] = filters.blogSort.split(',');
            blogParams.sort = sort;
            if (order) blogParams.order = order;
        }

        // Decide which API calls to make
        const destPromise = query ? searchDestinations({ ...destParams, query }) : getDestinations(destParams);
        const blogPromise = query ? blogApi.searchBlogs({ ...blogParams, query }) : blogApi.getBlogs(blogParams);

        const [destResponse, blogResponse] = await Promise.all([destPromise, blogPromise]);

        const fetchedDestinations = destResponse?.data?.places || destResponse?.data || [];
        const fetchedBlogs = blogResponse?.data?.blogs || blogResponse?.data || [];

        setResults({
          destinations: fetchedDestinations,
          blogs: fetchedBlogs,
        });

      } catch (err) {
        setError('Failed to fetch search results.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams, filters, tag, query]);

  const filteredResults = useMemo(() => {
    const { destinations, blogs } = results;
    switch (activeTab) {
      case 'destinations':
        return { items: destinations, type: 'destination' };
      case 'blogs':
        return { items: blogs, type: 'blog' };
      case 'all':
      default:
        return { items: [...destinations, ...blogs], type: 'all' };
    }
  }, [activeTab, results]);

  const renderGridItems = () => {
    if (loading) {
      return Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />);
    }

    if (filteredResults.items.length === 0) {
        if (query || tag) {
            return <NoResults query={query || `#${tag}`} />;
        } 
        return <div className="text-center col-span-full py-16">Nhập từ khóa để bắt đầu tìm kiếm hoặc chọn bộ lọc.</div>;
    }

    return filteredResults.items.map((item) => {
        if ('address' in item) { // It's a Destination
            const dest = item as Destination;
            return (
                <DestinationCard
                    key={`dest-${dest._id}`}
                    _id={dest._id}
                    title={dest.name}
                    location={dest.address}
                    distance={`${dest.ward}, ${dest.district}`}
                    image={dest.images[0] || '/placeholder.jpg'}
                    rating={dest.avgRating}
                    totalRatings={dest.totalRatings}
                />
            );
        }
        if ('content' in item) { // It's a Blog
            const post = item as Blog;
            return <PostCard key={`blog-${post._id}`} post={post} />;
        }
        return null;
    });
  };

  const tabs: { name: string; id: FilterType }[] = [
    { name: 'Tất cả', id: 'all' },
    { name: 'Địa điểm', id: 'destinations' },
    { name: 'Bài viết', id: 'blogs' },
  ];

  const pageTitle = () => {
      if (loading) return 'Đang tải...';
      if (query) {
          return (
              <>
                  Tìm thấy {filteredResults.items.length} kết quả cho 
                  <span className="text-[var(--primary)]"> &quot;{query}&quot;</span>
              </>
          );
      }
      if (tag) {
        return (
            <>
                Tìm thấy {filteredResults.items.length} kết quả cho tag
                <span className="text-[var(--primary)]"> &quot;#{tag}&quot;</span>
            </>
        );
    }
      return 'Khám phá tất cả địa điểm và bài viết';
  }

  return (
    <div className="relative overflow-hidden bg-[var(--background)] min-h-screen">
        <div className="absolute w-[500px] h-[450px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none -top-20 -left-96" />
        <div className="absolute w-[500px] h-[550px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none top-1/4 -right-96" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--foreground)] sm:text-4xl">
                {pageTitle()}
            </h1>
        </div>

        <SearchBox searchType={activeTab} />

        <div className="mt-8 mb-8 border-b border-[var(--gray-5)]">
            <nav className="-mb-px flex justify-center space-x-4 sm:space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                            activeTab === tab.id
                            ? 'border-[var(--primary)] text-[var(--primary)]'
                            : 'border-transparent text-[var(--gray-2)] hover:text-[var(--gray-1)] hover:border-[var(--gray-4)]'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                    >
                        {tab.name} ({
                            tab.id === 'all' ? results.destinations.length + results.blogs.length :
                            tab.id === 'destinations' ? results.destinations.length :
                            results.blogs.length
                        })
                    </button>
                ))}
            </nav>
        </div>

        <div className={`flex flex-col ${activeTab !== 'all' ? 'lg:grid lg:grid-cols-4 lg:gap-8' : ''}`}>
            {activeTab !== 'all' && (
                <div className="lg:hidden mb-4">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-dark)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)]"
                    >
                        {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                    </button>
                </div>
            )}

            {activeTab !== 'all' && (
                <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1 mb-8 lg:mb-0`}>
                    <SearchFilter 
                        filters={filters}
                        filterType={activeTab} 
                        onFilterChange={handleFilterChange} 
                        blogCategories={blogCategories}
                        placeCategories={placeCategories}
                    />
                </aside>
            )}

            <div className={activeTab !== 'all' ? 'lg:col-span-3' : 'lg:col-span-4'}>
                {error && <div className="text-center text-[var(--error)] col-span-full mb-4">{error}</div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {renderGridItems()}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main>
        <Header />
        <Suspense fallback={
            <div className="relative overflow-hidden bg-[var(--background)] min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)}
                    </div>
                </div>
            </div>
        }>
            <SearchResults />
        </Suspense>
        <Footer />
    </main>
  );
}