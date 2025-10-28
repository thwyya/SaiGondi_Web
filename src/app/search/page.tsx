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
import { GridPagination } from '@/shared/GridPagination';
import { Search, AlertCircle, ArrowLeft } from 'lucide-react';

// Define the possible filter types
// type FilterType = 'blogs';
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
 
  if (!query || query.trim() === "") {
    // Version đẹp: Hiển thị modal thông báo giữa màn hình
    const EmptySearchNotification = () => {
      const [countdown, setCountdown] = useState(5);

      useEffect(() => {
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              router.replace("/");
              return 0;
            }
            return prev - 1;
          });
        }, 1000); // đếm mỗi giây
        return () => clearInterval(timer);
      }, []);

      return (
        <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
          </div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-[90%] border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-4 shadow-lg">
                  <AlertCircle className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Chưa nhập từ khóa tìm kiếm
            </h3>
            <p className="text-gray-600 mb-6">
              Vui lòng nhập từ khóa để bắt đầu tìm kiếm địa điểm và bài viết
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>
                  Tự động chuyển về trang chủ sau{" "}
                  <span className="font-bold text-blue-600">{countdown}</span> giây
                </span>
              </div>
              <button
                onClick={() => router.replace("/")}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                <ArrowLeft className="w-5 h-5" />
                Quay về trang chủ ngay
              </button>
            </div>
            <div className="absolute -top-2 -right-2 w-20 h-20 bg-yellow-100 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -bottom-2 -left-2 w-24 h-24 bg-orange-100 rounded-full opacity-50 blur-2xl"></div>
          </div>
        </div>
      );
    };

    return <EmptySearchNotification />;
  }

  const [results, setResults] = useState<{ destinations: Destination[], blogs: Blog[] }>({ destinations: [], blogs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterType>(type);
  const [blogCategories, setBlogCategories] = useState<Category[]>([]);
  const [placeCategories, setPlaceCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMode, setFilterMode] = useState<'blogs' | 'destinations'>('blogs');

  const itemsPerPage = 12;

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
    setCurrentPage(1);
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
    } 
    setCurrentPage(1);
  }, [type]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build Destination Params (without rating)
        const destParams: any = { limit: 200 };
        if (filters.destWard) destParams.ward = filters.destWard;
        if (filters.placeCategory) destParams.category = filters.placeCategory;

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

        let fetchedDestinations = destResponse?.data?.places || destResponse?.data || [];
        const fetchedBlogs = blogResponse?.data?.blogs || blogResponse?.data || [];

        // Apply rating filter on the client
        if (filters.destRating) {
            const minRating = parseFloat(filters.destRating);
            const maxRating = minRating < 5 ? minRating + 1 : 10; // Use a high number for max if it's 5 stars

            fetchedDestinations = fetchedDestinations.filter((dest: Destination) => {
                if (dest.avgRating === undefined) return false;
                return dest.avgRating >= minRating && dest.avgRating < maxRating;
            });
        }

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
      default:
        return { items: [...destinations, ...blogs], type: 'all' };
    }
  }, [activeTab, results]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredResults.items.slice(startIndex, endIndex);
  }, [filteredResults.items, currentPage, itemsPerPage]);

  const renderGridItems = () => {
    if (loading) {
      return Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />);
    }

    if (paginatedItems.length === 0) {
        if (query || tag) {
            return <NoResults query={query || `#${tag}`} />;
        } 
        return <div className="text-center col-span-full py-16">Nhập từ khóa để bắt đầu tìm kiếm hoặc chọn bộ lọc.</div>;
    }

    return paginatedItems.map((item) => {
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
    <div className="relative overflow-hidden bg-[var(--background)] flex flex-col flex-grow">
        <div className="absolute w-[500px] h-[450px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none -top-20 -left-96" />
        <div className="absolute w-[500px] h-[550px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none top-1/4 -right-96" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-8 relative z-10 pb-16 flex-grow flex flex-col">
        <div className="max-w-3xl mx-auto text-center mb-4">
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--foreground)] sm:text-4xl">
                {pageTitle()}
            </h1>
        </div>

        <SearchBox searchType={activeTab} />

        <div className="flex-grow lg:grid lg:grid-cols-4 lg:gap-8">
         <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1 mb-8 lg:mb-0`}>
          {activeTab === 'all' && (
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Chọn loại lọc:
              </label>
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as 'blogs' | 'destinations')}
                className="w-full p-2 border rounded-lg focus:ring focus:ring-green-300"
              >
                <option value="blogs">Bài viết</option>
                <option value="destinations">Địa điểm</option>
              </select>
            </div>
          )}

          <SearchFilter 
            filters={filters}
            filterType={activeTab === 'all' ? filterMode : activeTab} 
            onFilterChange={handleFilterChange} 
            blogCategories={blogCategories}
            placeCategories={placeCategories}
          />
        </aside>



          <div className="min-h-[120vh] lg:col-span-3">
            {error && <div className="text-center text-[var(--error)] col-span-full mb-4">{error}</div>}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${activeTab === 'all' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              {renderGridItems()}
            </div>
            <GridPagination 
              totalItems={filteredResults.items.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex">
            <Suspense fallback={
                <div className="relative overflow-hidden bg-[var(--background)] flex-grow">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)}
                        </div>
                    </div>
                </div>
            }>
                <SearchResults />
            </Suspense>
        </main>
        <Footer />
    </div>
  );
}