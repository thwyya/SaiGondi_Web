"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import DestinationCard from "@/components/cards/DestinationCard";
import PostCard from "@/components/PostCard";
import FilterPanel from "@/components/filters/FilterPanel";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/ui/SearchBox";
import { Blog } from "@/types/blog";
import { Destination } from "@/types/destination";

// Define a type for the filters
interface SearchFilters {
  category: string;
  district: string;
  ward: string;
  rating: number;
}

type SearchType = "all" | "destinations" | "blogs";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState<SearchType>("all");

  const [filters, setFilters] = useState<SearchFilters>({
    category: "",
    district: "",
    ward: "",
    rating: 0,
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDestinations, setTotalDestinations] = useState(0);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const itemsPerPage = 9; // 3x3 grid

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      setDestinations([]);
      setBlogs([]);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      try {
        let destPromise: Promise<any> | null = null;
        let blogPromise: Promise<any> | null = null;

        // Common params
        const baseParams = {
          query,
          page: String(currentPage),
          limit: String(itemsPerPage),
        };

        if (searchType === 'all' || searchType === 'destinations') {
          const destParams = new URLSearchParams(baseParams);
          if (filters.category) destParams.append("category", filters.category);
          if (filters.district) destParams.append("district", filters.district);
          if (filters.ward) destParams.append("ward", filters.ward);
          if (filters.rating > 0) destParams.append("rating", String(filters.rating));
          
          destPromise = fetch(`${API_URL}/places/search?${destParams.toString()}`).then(res => res.json());
        }

        if (searchType === 'all' || searchType === 'blogs') {
          const blogParams = new URLSearchParams(baseParams);
          // Assuming no specific blog filters from the panel for now
          blogPromise = fetch(`${API_URL}/blogs?${blogParams.toString()}`).then(res => res.json());
        }

        const [destResult, blogResult] = await Promise.all([destPromise, blogPromise]);

        let totalDest = 0;
        let totalDestPages = 1;
        if (destResult && destResult.data) {
          setDestinations(destResult.data.places || []);
          totalDest = destResult.data.pagination?.total || 0;
          totalDestPages = destResult.data.pagination?.totalPages || 1;
        }
        setTotalDestinations(totalDest);

        let totalBl = 0;
        let totalBlogPages = 1;
        if (blogResult && blogResult.data) {
          // The blog API response has an extra 'data' nesting
          setBlogs(blogResult.data.data || []);
          totalBl = blogResult.data.pagination?.total || 0;
          totalBlogPages = blogResult.data.pagination?.totalPages || 1;
        }
        setTotalBlogs(totalBl);

        if (searchType === "destinations") {
          setTotalPages(totalDestPages);
        } else if (searchType === "blogs") {
          setTotalPages(totalBlogPages);
        } else { // 'all'
          setTotalPages(Math.max(totalDestPages, totalBlogPages));
        }

      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setDestinations([]);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, filters, currentPage, searchType]);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setCurrentPage(1); // Reset to first page on filter change
    if (newFilters.district !== undefined) {
      setFilters((prev) => ({ ...prev, ...newFilters, ward: "" }));
    } else {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    }
  };
  
  const handleTabChange = (type: SearchType) => {
    setSearchType(type);
    setCurrentPage(1); // Reset page when changing tabs
  }

  // Pagination helper
  function getPageNumbers(current: number, total: number): (number | string)[] {
    const delta = 2;
    const pages: (number | string)[] = [];
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }
  
  const renderResults = () => {
    const showDestinations = searchType === 'all' || searchType === 'destinations';
    const showBlogs = searchType === 'all' || searchType === 'blogs';

    if (loading) {
      return <p className="text-center mt-12">Đang tải kết quả...</p>;
    }

    if (destinations.length === 0 && blogs.length === 0) {
      return <p className="text-gray-600 text-center mt-12">Không tìm thấy kết quả nào phù hợp.</p>;
    }

    return (
      <div className="space-y-12">
        {showDestinations && destinations.length > 0 && (
          <div>
            {searchType === 'all' && <h2 className="text-xl font-bold mb-4">Địa điểm</h2>}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {destinations.map((destination) => (
                <DestinationCard
                  key={destination._id}
                  _id={destination._id}
                  title={destination.name}
                  location={destination.address}
                  distance={"350m"}
                  image={destination.images?.[0] || "/image.svg"}
                  rating={destination.avgRating}
                  totalRatings={destination.totalRatings}
                />
              ))}
            </div>
          </div>
        )}
        {showBlogs && blogs.length > 0 && (
          <div>
            {searchType === 'all' && <h2 className="text-xl font-bold mb-4">Bài viết</h2>}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {blogs.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const getTotalResultsForDisplay = () => {
    if (searchType === 'destinations') return totalDestinations;
    if (searchType === 'blogs') return totalBlogs;
    return totalDestinations + totalBlogs;
  }
  
  const getCurrentResultsLength = () => {
    if (searchType === 'destinations') return destinations.length;
    if (searchType === 'blogs') return blogs.length;
    return destinations.length + blogs.length;
  }

  return (
    <>
      <Header />
      <main className="relative overflow-hidden min-h-screen bg-white z-10">
        {/* Background Blurs */}
        <div className="absolute w-[500px] h-[450px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "200px", left: "-420px" }} />
        <div className="absolute w-[500px] h-[550px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "700px", right: "-400px" }} />
        <div className="absolute w-[400px] h-[300px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: "1400px", left: "-300px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchBox />

          <div className="flex gap-12 mt-8">
            {/* Filter Panel */}
            <aside className="hidden lg:block w-[30%]">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </aside>

            {/* Main Content */}
            <div className="w-full lg:w-[70%]">
              <h1 className="text-2xl font-bold mb-4">
                Kết quả tìm kiếm {query && <>cho: &quot;{query}&quot;</>}
              </h1>

              {/* Tabs */}
              <div className="grid grid-cols-3 border rounded-2xl shadow bg-white mb-8">
                <button onClick={() => handleTabChange('all')} className={`flex flex-col border-r px-4 py-3 rounded-tl-2xl rounded-bl-2xl text-left ${searchType === 'all' ? 'bg-gray-100' : ''}`}>
                  <h4 className="font-bold">Tất cả</h4>
                  <p className="text-gray-500">{totalDestinations + totalBlogs} kết quả</p>
                </button>
                <button onClick={() => handleTabChange('destinations')} className={`flex flex-col border-r px-4 py-3 text-left ${searchType === 'destinations' ? 'bg-gray-100' : ''}`}>
                  <h4 className="font-bold">Địa điểm</h4>
                  <p className="text-gray-500">{totalDestinations} kết quả</p>
                </button>
                <button onClick={() => handleTabChange('blogs')} className={`flex flex-col px-4 py-3 rounded-tr-2xl rounded-br-2xl text-left ${searchType === 'blogs' ? 'bg-gray-100' : ''}`}>
                  <h4 className="font-bold">Bài viết</h4>
                  <p className="text-gray-500">{totalBlogs} kết quả</p>
                </button>
              </div>

              {/* Sort */}
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm lg:text-base">
                  Hiển thị {getCurrentResultsLength()}/{getTotalResultsForDisplay()} kết quả
                </h4>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm lg:text-base">Sắp xếp theo:</h4>
                  <select className="rounded-md focus:outline-none text-sm lg:text-base border px-2 py-1">
                    <option value="popular">Phổ biến nhất</option>
                    <option value="rating">Đánh giá cao nhất</option>
                    <option value="newest">Mới nhất</option>
                  </select>
                </div>
              </div>

              {/* Results */}
              {renderResults()}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex justify-center mt-12 gap-2 flex-wrap">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50"
                  >
                    Trước
                  </button>
                  {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                    page === "..." ? (
                      <span key={idx} className="px-3 py-1">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page as number)}
                        className={`px-3 py-1 border rounded-lg ${
                          currentPage === page
                            ? "bg-primary text-white"
                            : "bg-white hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded-lg disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default SearchPage;