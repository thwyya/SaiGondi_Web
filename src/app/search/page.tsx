'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchDestinations } from '@/lib/place/destinationApi';
import { blogApi } from '@/lib/blog/blogApi';
import DestinationCard from '@/components/cards/DestinationCard';
import PostCard from '@/components/PostCard';
import { Destination } from '@/types/destination';
import { Blog } from '@/types/blog';
import { FiAlertCircle } from 'react-icons/fi';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBox from '@/components/ui/SearchBox';

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
        <h3 className="mt-2 text-lg font-medium text-[var(--foreground)]">No results found</h3>
        <p className="mt-1 text-sm text-[var(--gray-2)]">
            We couldn&apos;t find anything for &quot;{query}&quot;. Try a different search.
        </p>
    </div>
);


function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const type = searchParams.get('type') || 'all';

  const [results, setResults] = useState<{ destinations: Destination[], blogs: Blog[] }>({ destinations: [], blogs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(type);

  useEffect(() => {
    setActiveTab(type);
  }, [type]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [destResponse, blogResponse] = await Promise.all([
          searchDestinations({ query: query }),
          blogApi.searchBlogs({ query: query })
        ]);

        setResults({
          destinations: destResponse?.data || [],
          blogs: blogResponse?.data || [],
        });

      } catch (err) {
        setError('Failed to fetch search results.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

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
      return <NoResults query={query} />;
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

  const tabs = [
    { name: 'Tất cả', id: 'all' },
    { name: 'Địa điểm', id: 'destinations' },
    { name: 'Bài viết', id: 'blogs' },
  ];

  return (
    <div className="relative overflow-hidden bg-[var(--background)] min-h-screen">
        {/* Decorative background elements from homepage */}
        <div className="absolute w-[500px] h-[450px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none -top-20 -left-96" />
        <div className="absolute w-[500px] h-[550px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none top-1/4 -right-96" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-4">
            <h1 className="text-3xl font-extrabold text-[var(--foreground)] sm:text-4xl">
                {loading ? (
                    'Đang tìm kiếm...'
                ) : (
                    <>
                        Tìm thấy {filteredResults.items.length} kết quả cho 
                        <span className="text-[var(--primary)]"> &quot;{query}&quot;</span>
                    </>
                )}
            </h1>
        </div>

        <SearchBox searchType={activeTab as 'all' | 'destinations' | 'blogs'} />

        <div className="mt-8 mb-8 border-b border-[var(--gray-5)]">
            <nav className="-mb-px flex justify-center space-x-8" aria-label="Tabs">
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

        {error && <div className="text-center text-[var(--error)] col-span-full">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {renderGridItems()}
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