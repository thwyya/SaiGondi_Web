"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { searchDestinations } from "@/lib/place/destinationApi";
import DestinationCard from "@/components/cards/DestinationCard";
import FilterPanel from "@/components/filters/FilterPanel";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBox from "@/components/ui/SearchBox";

// Define a type for the filters
interface SearchFilters {
  category: string;
  district: string;
  ward: string;
  rating: number;
}

const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    district: '',
    ward: '',
    rating: 0,
  });

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const itemsPerPage = 9; // 3x3 grid

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const searchParams: any = {
          query: query,
          page: currentPage,
          limit: itemsPerPage,
        };
        if (filters.category) searchParams.category = filters.category;
        if (filters.district) searchParams.district = filters.district;
        if (filters.ward) searchParams.ward = filters.ward;
        if (filters.rating > 0) searchParams.avgRating = filters.rating;

        const res = await searchDestinations(searchParams);
        setResults(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotalResults(res.pagination?.total || 0);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, filters, currentPage]);

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setCurrentPage(1); // Reset to first page on filter change
    if (newFilters.district !== undefined) {
      setFilters((prev) => ({ ...prev, ...newFilters, ward: '' }));
    } else {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    }
  };

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

  return (
    <>
      <Header />
      <main className="relative overflow-hidden min-h-screen  z-10">
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
                <div className="flex flex-col border-r px-4 py-3 rounded-tl-2xl rounded-bl-2xl">
                  <h4 className="font-bold">Tất cả</h4>
                  <p className="text-gray-500">{totalResults} kết quả</p>
                </div>
                <div className="flex flex-col border-r px-4 py-3">
                  <h4 className="font-bold">Địa điểm</h4>
                  <p className="text-gray-500">--</p>
                </div>
                <div className="flex flex-col px-4 py-3 rounded-tr-2xl rounded-br-2xl">
                  <h4 className="font-bold">Bài viết</h4>
                  <p className="text-gray-500">--</p>
                </div>
              </div>

              {/* Sort */}
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm lg:text-base">
                  Hiển thị {results.length}/{totalResults} kết quả
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

              {/* Results Grid */}
              {loading ? (
                <p className="text-center mt-12">Đang tải kết quả...</p>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {results.map((destination) => (
                    <DestinationCard
                      key={destination._id}
                      _id={destination._id}
                      title={destination.name}
                      location={destination.address}
                      distance={"350m"}
                      image={destination.images?.[0] || '/image.svg'}
                      rating={destination.avgRating}
                      totalRatings={destination.totalRatings}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center mt-12">
                  Không tìm thấy kết quả nào phù hợp.
                </p>
              )}

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