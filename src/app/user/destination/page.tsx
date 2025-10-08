"use client";

import { useEffect, useState, useMemo } from "react";
import BackgroundBlur from "@/shared/BackgroundBlur";
import Slider from "rc-slider";
import Tooltip from "rc-tooltip";
import "rc-tooltip/assets/bootstrap.css";
import "rc-slider/assets/index.css";
import DestinationCard from "./DestinationCard";
import SearchBox from "@/components/ui/SearchBox";
import { getDestinations } from "@/lib/place/destinationApi";
import { useSearchParams } from "next/navigation";
import { checkinApi } from "@/lib/checkin/checkinApi";
import { AddPlace, ServiceOption } from "./addPlaceForm";
import Button from "@/components/ui/Button";

export interface CategoryOption {
  id: string
  name: string
}
export interface Category {
  _id: string
  name: string
  description?: string
}
export default function DestinationPage() {
  const [open, setOpen] = useState(false)
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  // State quản lý filter
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('rating');


  // State dữ liệu
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([])
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')

  // State phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDestinations, setTotalDestinations] = useState(0);
  const itemsPerPage = 10;

  // Search places API function
  const searchPlaces = async (filterCriteria: any) => {
    try {
      const response = await fetch('http://localhost:5000/api/places/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterCriteria),
      });
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  };

  // Fetch API khi filter/page thay đổi
  useEffect(() => {
    // Debounce để tránh gọi API quá nhiều
    const timeoutId = setTimeout(() => {
      const fetchData = async () => {
        try {
          setLoading(true); 
          if (type === "hot") {
            const hotPlaces = await checkinApi.getHotPlaces();
            setDestinations(hotPlaces || []);
            setTotalDestinations(hotPlaces?.length || 0);
            setTotalPages(1); // không cần phân trang nếu API hot chưa hỗ trợ
          } else {
            const res = await getDestinations({
              services: selectedOptions,
              page: currentPage,
              limit: itemsPerPage,
              sortBy: sortBy, 
            });
            setDestinations(res.data.places || []);
            setTotalPages(res.data.pagination?.totalPages || 1);
            setTotalDestinations(res.data.pagination?.total || 0);
          }
        } catch (err: any) {
          console.error("Fetch destinations error:", err);
          // Handle rate limit error gracefully
          if (err.response?.status === 429) {
            console.warn("Rate limited. Please try again later.");
          }
        } finally {
          setLoading(false);
        }
      };

      const fetchServices = async () => {
        try {
          const res = await fetch("http://localhost:5000/api/services")
          if (!res.ok) throw new Error("Failed to fetch services")
          const data = await res.json()
          console.log("services api responsse:", data)

          const formatted = data.data.map((service: ServiceOption) => ({
            id: service.id,
            name: service.name
          }))
          setServiceOptions(formatted)
        } catch (err) {
          console.error(err)
        }
      }
      
      const fetchCategories = async (params: Record<string, string | number | boolean>) => {
        try {
          const url = new URL('http://localhost:5000/api/admin/categories')
          Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null) url.searchParams.append(k, String(v))
          })

          const res = await fetch(url.toString(), { method: 'GET' })
          if (!res.ok) throw new Error('Failed to fetch categories')
          const data = await res.json()
          console.log('categories api response:', data)
          const formatted: CategoryOption[] = data.data.map((category: Category) => ({
            id: category._id,
            name: category.name
          }))
          setCategoryOptions(formatted)
        } catch (err) {
          console.error(err)
        }
      }

      // Only fetch services and categories once
      if (serviceOptions.length === 0) {
        fetchServices()
      }
      if (categoryOptions.length === 0) {
        fetchCategories({'type': 'place'})
      }
      
      fetchData();
    }, 500); 

    return () => clearTimeout(timeoutId);
  }, [
    minPrice, 
    maxPrice, 
    JSON.stringify(selectedOptions), 
    currentPage, 
    selectedCategory || 'all', 
    sortBy || 'rating', 
    selectedRating ?? 0, 
    type || ''
  ]);

  // Handle thay đổi checkbox filter
  const checkboxChangeHandle = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };
  const filteredDestinations = destinations.filter(destination =>
    selectedOptions.every(option => destination.services?.includes(option)) &&
    (selectedRating === null || (destination.avgRating ?? 0) >= selectedRating) &&
    (selectedCategory === 'all' || 
      destination?.categories?.some((cat: any) => cat?.id === selectedCategory)
    )
  ).sort((a, b) => {
    // Apply sorting based on sortBy state
    switch (sortBy) {
      case 'rating':
        return (b.avgRating || 0) - (a.avgRating || 0);
      case 'popular':
        return (b.totalRatings || 0) - (a.totalRatings || 0);
      case 'newest':
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      default:
        return 0;
    }
  });

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};

    for (const dest of destinations) {
      dest?.categories?.forEach((cat: any) => {
        if (cat?.id) {
          map[cat.id] = (map[cat.id] || 0) + 1;
        }
      });
    }

    return map;
  }, [destinations]);


  // Sắp xếp categories theo số lượng giảm dần để tabs hiển thị cái nhiều người dùng nhất trước
  const sortedCategoryOptions = useMemo(() => {
    if (!categoryOptions || categoryOptions.length === 0) return categoryOptions;
    return [...categoryOptions].sort((a, b) => (categoryCounts[b.id] || 0) - (categoryCounts[a.id] || 0));
  }, [categoryOptions, categoryCounts]);

  // Tạo danh sách page hiển thị (có "...")
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
    <main className="relative min-h-screen bg-white z-10 w-[90%] mx-auto">
      <BackgroundBlur />
      <SearchBox searchType="destinations" />

      <div className="flex gap-12 mb-12">
        {/* Bộ lọc */}
        <div id="filter" className="hidden lg:flex flex-col w-[30%]">
          <h2 className="font-bold text-lg">BỘ LỌC</h2>

          {/* Giá */}
          <div className="flex justify-between mt-4">
            <h6 className="font-semibold">Giá</h6>
            <i className="ri-arrow-down-wide-line"></i>
          </div>
          <Slider
            range
            min={0}
            max={10000000}
            value={[minPrice, maxPrice]}
            onChange={(value) => {
              const [min, max] = value as number[];
              setMinPrice(min);
              setMaxPrice(max);
            }}
            trackStyle={{ backgroundColor: "var(--primary)", height: 12 }}
            handleStyle={{
              borderColor: "var(--primary)",
              backgroundColor: "#fff",
              borderWidth: 2,
              height: 20,
              width: 20,
              marginTop: -4,
            }}
            railStyle={{ backgroundColor: "#e5e5e5", height: 12 }}
            handleRender={(node, handleProps) => (
              <Tooltip
                overlay={`${(
                  Math.round(handleProps.value / 10000) * 10000
                ).toLocaleString("vi-VN")} VND`}
                visible={handleProps.dragging}
                placement="top"
                overlayInnerStyle={{
                  fontSize: 12,
                  padding: "4px 8px",
                  color: "#000",
                  background: "#fff",
                }}
                overlayClassName="!z-50"
              >
                {node}
              </Tooltip>
            )}
          />

          <span className="block h-px bg-gray-300 my-6" />

          {/* Xếp hạng */}
          <h4 className="font-semibold">Xếp hạng</h4>
          <div className="flex gap-2 lg:gap-4 lg:mt-4 cursor-pointer">
            {[0, 1, 2, 3, 4].map((star) => (
              <div
                key={star}
                className={`border h-6 w-6 p-4 flex items-center justify-center rounded-[4px] border-[#8DD3BB] ${selectedRating === star ? "bg-primary text-white" : ""
                  }`}
                onClick={() => {
                  setSelectedRating(star);
                  setCurrentPage(1);
                }}
              >
                {star}+
              </div>
            ))}
          </div>

          <span className="block h-px overflow-hidden bg-gray-400 lg:my-8 origin-top scale-y-20" />

          {/* Dịch vụ nổi bật */}
          <h4 className="font-semibold">Dịch vụ nổi bật</h4>
          <div className="flex flex-col mt-3 space-y-2">
            {serviceOptions.map((option) => (
              <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option.id)}
                  onChange={() => checkboxChangeHandle(option.id)}
                />
                {option.name}
              </label>
            ))}
          </div>

          <span className="block h-px bg-gray-300 my-6" />


          <div className="flex flex-col items-center max-h-2">
            <Button
              onClick={() => setOpen(true)}
              className="btn-primary w-[70%] sm:w-[80%] h-10 rounded-3xl text-white text-sm cursor-pointer"
            >
              Thêm địa điểm
            </Button>

            <AddPlace open={open} setOpen={setOpen} />
          </div>
        </div>

        {/* Danh sách điểm đến */}
        <div className="flex flex-col w-full scrollbar-hide  ">
          {/* Tabs (render fetched categories) */}
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex items-stretch gap-2 px-3 py-2 ">
              {/* Always show 'Tất cả' first */}
              <button
                onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
                className={`flex flex-col min-w-[100px] items-center gap-1 px-4 py-3 rounded-xl transition-all shrink-0 ${selectedCategory === 'all' ? ' text-black shadow-md border-b-4 border-blue-500' : 'bg-auto border border-[var(--gray-5)] hover:bg-blue-50'}`}
              >
                <span className="font-semibold">Tất cả</span>
              </button>

              {sortedCategoryOptions && sortedCategoryOptions.length > 0 ? (
                sortedCategoryOptions.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                    className={`flex flex-col items-center min-w-[100px] gap-1 px-4 py-3 rounded-xl transition-all shrink-0 ${selectedCategory === cat.id ? ' text-black shadow-md border-b-4 border-blue-500' : 'bg-auto border border-[var(--gray-5)] hover:bg-blue-50'}`}
                  >
                    <span className="font-semibold">{cat.name}</span>
                  </button>
                ))
              ) : (
                // fallback when no categories loaded
                <>
                  <div className="flex flex-col items-start gap-1 px-4 py-3 rounded-xl bg-white">
                    <h4 className="font-bold">Ăn uống</h4>
                    <p className="text-gray-500">--</p>
                  </div>
                  <div className="flex flex-col items-start gap-1 px-4 py-3 rounded-xl bg-white">
                    <h4 className="font-bold">Vui chơi</h4>
                    <p className="text-gray-500">--</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sort */}
          <div className="flex justify-end mt-4">
            <div className="flex items-center gap-3">
              <h4 className="text-sm lg:text-base font-medium text-gray-700">Sắp xếp theo:</h4>
              <select 
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  setCurrentPage(1); 
                }} 
                className="
                  bg-white border border-gray-300 rounded-lg px-4 py-2 
                  text-sm lg:text-base font-medium text-[#555555]
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  hover:border-gray-400 transition-colors duration-200
                  cursor-pointer min-w-[160px] shadow-sm
                "
              >
                <option value="rating" className="py-2">Đánh giá cao nhất</option>
                <option value="popular" className="py-2">Phổ biến nhất</option>
                <option value="newest" className="py-2">Mới nhất</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold">
            {type === "hot" ? "Địa điểm hot" : "Tất cả"}
            </h4>
          </div>
          {/* List */}
          <div className="flex flex-col mt-8 gap-6">
            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : filteredDestinations.length > 0 ? (
              filteredDestinations.map((destination) => (
                  <DestinationCard key={destination._id} destination={destination} />
              ))
                ) : (
                  <p>Không tìm thấy địa điểm phù hợp.</p>
                )}
              </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2 flex-wrap">
              {/* Prev */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 cursor-pointer"
              >
                Trước
              </button>

              {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                page === "..." ? (
                  <span key={idx} className="px-3 py-1">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`px-3 py-1 border rounded-lg cursor-pointer ${currentPage === page
                      ? "bg-primary text-white"
                      : "bg-white hover:bg-gray-100"
                      }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 cursor-pointer"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}