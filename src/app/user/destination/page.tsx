"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import "rc-tooltip/assets/bootstrap.css";
import "rc-slider/assets/index.css";
import DestinationCard from "./DestinationCard";
import SearchBox from "@/components/ui/SearchBox";
import { getDestinations, getServices, getCategories } from "@/lib/place/destinationApi";
import { checkinApi } from "@/lib/checkin/checkinApi";
import { AddPlace, ServiceOption } from "./addPlaceForm";
import { GoStarFill } from "react-icons/go";
import { IoIosClose } from "react-icons/io";
import Button from "@/components/ui/Button";
import { CiFilter } from "react-icons/ci";
import Select from "react-select";
import { IoIosAddCircleOutline } from "react-icons/io";
import axios from "axios";

export interface CategoryOption {
  id: string
  name: string
}
export interface DistrictOption {
  id: string;
  name: string;
}


export default function DestinationPage() {
  const [open, setOpen] = useState(false)
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State dữ liệu
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([])
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // State phân trang
  const [totalPages, setTotalPages] = useState(1);
  const [totalDestinations, setTotalDestinations] = useState(0);
  const itemsPerPage = 10;

  // Lấy filter từ URL
  const type = searchParams.get("type");
  const currentPage = Number(searchParams.get('page')) || 1;
  const sortBy = searchParams.get('sortBy') || 'rating';
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedRating = searchParams.get('rating');
  const selectedServices = searchParams.getAll('services');
  const selectedDistrict = searchParams.get('district');


  const options = [
    { value: "rating", label: "Đánh giá cao nhất" },
    { value: "popular", label: "Phổ biến nhất" },
    { value: "newest", label: "Mới nhất" },
  ];

  const handleFilterChange = useCallback(
    (name: string, value: string | string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (name === 'page') {
        params.set(name, value as string);
      } else {
        // Reset page to 1 for any other filter change
        params.set('page', '1');
        if (Array.isArray(value)) {
          params.delete(name);
          value.forEach(v => params.append(name, v));
        } else if (value) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      }
      
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router]
  );
  
  const clearFilters = () => {
    router.push(pathname);
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isFilterOpen]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (type === "hot") {
          const hotPlaces = await checkinApi.getHotPlaces();
          setDestinations(hotPlaces || []);
          setTotalDestinations(hotPlaces?.length || 0);
          setTotalPages(1);
        } else {
          const params: any = {
            page: currentPage,
            limit: itemsPerPage,
            sortBy: sortBy,
          };
          if (selectedServices.length > 0) {
            params.services = selectedServices;
          }
          if (selectedCategory !== 'all') {
            params.categories = selectedCategory;
          }
          if (selectedRating !== null) {
            params.minRating = selectedRating;
          }
          if (selectedDistrict) {
            params.district = selectedDistrict;
          }

          const res = await getDestinations(params);
          setDestinations(res.data.places || []);
          setTotalPages(res.data.pagination?.totalPages || 1);
          setTotalDestinations(res.data.pagination?.total || 0);
        }
      } catch (err: any) {
        console.error("Fetch destinations error:", err);
        if (err.response?.status === 429) {
          console.warn("Rate limited. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    const fetchServices = async () => {
      try {
        const res = await getServices();
        const formatted = res.data.map((service: ServiceOption) => ({
          id: service.id,
          name: service.name
        }))
        setServiceOptions(formatted)
      } catch (err) {
        console.error(err)
      }
    }

    const fetchCategories = async () => {
      try {
        const res = await getCategories({ type: 'place' });
        const list = (res?.data ?? res) as Array<{ _id: string; name: string }>;
        const formatted: CategoryOption[] = (list || []).map((category) => ({
          id: category._id,
          name: category.name,
        }));
        setCategoryOptions(formatted);
      } catch (err) {
        console.error("fetch categories error:", err);
      }
    };
    
    const fetchDistricts = async () => {
      try {
        // Assuming an API endpoint /api/districts
        const res = await axios.get('http://localhost:5000/api/districts');
        const formatted: DistrictOption[] = (res.data.data || []).map((district: any) => ({
          id: district._id,
          name: district.name,
        }));
        setDistricts(formatted);
      } catch (err) {
        console.error("fetch districts error:", err);
      }
    };


    if (serviceOptions.length === 0) {
      fetchServices()
    }
    if (categoryOptions.length === 0) {
      fetchCategories()
    }
    if (districts.length === 0) {
      fetchDistricts();
    }
    fetchData();

  }, [searchParams, type, serviceOptions.length, categoryOptions.length, districts.length]);


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
    <main className="relative overflow-hidden">
      {/* blur */}
      <div className="absolute w-[500px] h-[500px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none -z-10" style={{ top: '270px', left: '-240px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none -z-10" style={{ top: '600px', left: '1200px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none -z-10 " style={{ top: '1100px', left: '-60px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none -z-10" style={{ top: '2000px', left: '1300px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none -z-10" style={{ top: '2500px', left: '-60px' }} />

      <div className="relative min-h-screen z-10 w-[95%] sm:w-[90%] mx-auto px-4 sm:px-0">
        <SearchBox />

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-12 mb-12">
          {/* Bộ lọc */}
          <div ref={filterRef} id="filter" className={`lg:flex flex-col w-full lg:w-[30%] bg-white lg:bg-transparent p-4 lg:p-0 rounded-lg lg:rounded-none shadow-lg lg:shadow-none ${isFilterOpen ? 'flex' : 'hidden'}`}>
            <div className="flex justify-between items-center mb-2 lg:hidden">
               <h2 className="font-bold text-lg">BỘ LỌC</h2>
              <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">
                <IoIosClose className="text-3xl" />
              </button>
            </div>
             <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg hidden lg:block">BỘ LỌC</h2>
                <button onClick={clearFilters} className="text-sm text-blue-500 hover:underline">Xóa bộ lọc</button>
            </div>
            <span className="block h-px bg-gray-300 my-4 lg:my-6" />
            
            {/* District Filter */}
            <h4 className="font-semibold mb-3">Khu vực</h4>
            <Select
              value={districts.find(d => d.id === selectedDistrict)}
              onChange={(o) => handleFilterChange('district', o?.id || '')}
              options={districts.map(d => ({ value: d.id, label: d.name }))}
              placeholder="Chọn khu vực"
              isClearable
              styles={{ menu: (b) => ({ ...b, zIndex: 40 }) }}
            />
            <span className="block h-px bg-gray-400 my-4 lg:my-8" />

            {/* Xếp hạng */}
            <h4 className="font-semibold mb-3">Xếp hạng</h4>
            <div className="grid grid-cols-5 gap-4 lg:flex lg:gap-4 cursor-pointer">
              {[0, 1, 2, 3, 4].map((star) => (
                <div
                  key={star}
                  className={`border-2 border-white shadow-md h-8 w-full lg:h-6 lg:w-6 p-2 lg:p-4 flex items-center justify-center rounded-[4px]  text-xs lg:text-sm  ${selectedRating === String(star) ? "bg-primary text-white" : ""}`}
                  onClick={() => handleFilterChange('rating', String(star))}
                >
                  {star} <i className="ml-1 text-sm text-yellow-500"><GoStarFill /></i>
                </div>
              ))}
            </div>

            <span className="block h-px bg-gray-400 my-4 lg:my-8" />

            {/* Dịch vụ nổi bật */}
            <h4 className="font-semibold mb-3">Dịch vụ nổi bật</h4>
            <div className="flex flex-col max-h-40 lg:max-h-none overflow-y-auto lg:overflow-visible space-y-2">
              {serviceOptions.map((option) => (
                <label key={option.id} className="flex items-center gap-2 cursor-pointer  text-sm lg:text-base">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(option.id)}
                    onChange={() => {
                      const newServices = selectedServices.includes(option.id)
                        ? selectedServices.filter(item => item !== option.id)
                        : [...selectedServices, option.id];
                      handleFilterChange('services', newServices);
                    }}
                    className="h-4 w-4"
                  />
                  {option.name}
                </label>
              ))}
            </div>

            <span className="block h-px bg-gray-300 my-4 lg:my-6" />

            <div className="hidden lg:flex flex-col items-center py-4">
              <Button
                onClick={() => setOpen(true)}
                className="btn-primary w-full sm:w-[80%] lg:w-[70%] h-10 rounded-3xl text-white text-sm cursor-pointer"
              >
                Thêm địa điểm
              </Button>
              <AddPlace open={open} setOpen={setOpen} />
            </div>
          </div>


          {/* Danh sách điểm đến */}
          <div className="flex flex-col w-full lg:flex-1">
            {/* Tabs (render fetched categories) */}
            <div className="overflow-x-auto no-scrollbar mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex items-stretch gap-2 px-2 lg:px-3 py-2 min-w-max">
                <button
                  onClick={() => handleFilterChange('category', 'all')}
                  className={`flex flex-col min-w-[80px] lg:min-w-[100px] items-center gap-1 px-3 lg:px-4 py-2  lg:py-3 rounded-xl transition-all shrink-0 text-sm lg:text-base  ${selectedCategory === 'all' ? ' text-black shadow-md border-b-4 border-blue-500' : 'bg-auto border border-[var(--gray-5)] hover:bg-blue-50'}`}
                >
                  <span className="font-semibold">Tất cả</span>
                </button>

                {categoryOptions && categoryOptions.length > 0 &&
                  categoryOptions.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleFilterChange('category', cat.id)}
                      className={`flex flex-col items-center min-w-[80px] lg:min-w-[100px] gap-1 px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all shrink-0 text-sm lg:text-base ${selectedCategory === cat.id ? ' text-black shadow-md border-b-4 border-blue-500' : 'bg-auto border border-[var(--gray-5)] hover:bg-blue-50'}`}
                    >
                      <span className="font-semibold">{cat.name}</span>
                    </button>
                  ))
                }
              </div>
            </div>


            {/* Sort and Actions Bar */}
            <div className="flex items-center justify-between gap-2 mb-4 ">
              <div className="flex items-center gap-2 flex-1">
                <h4 className="text-sm lg:text-base font-medium text-gray-700 whitespace-nowrap">Sắp xếp theo:</h4>
                <div className="flex-1 max-w-[200px]">
                  <Select
                    value={options.find((o) => o.value === sortBy)}
                    onChange={(o) => handleFilterChange('sortBy', o?.value || 'rating')}
                    options={options}
                    placeholder="Sắp xếp"
                    styles={{
                      control: (b, s) => ({ ...b, width: '100%', minHeight: 36, borderRadius: 8, borderColor: s.isFocused ? "#3b82f6" : "#d1d5db", boxShadow: s.isFocused ? "0 0 0 2px rgba(59,130,246,0.3)" : "none", "&:hover": { borderColor: "#9ca3af" }, cursor: "pointer" }),
                      valueContainer: (b) => ({ ...b, padding: "2px 8px", fontSize: 14, color: "#555" }),
                      menu: (b) => ({ ...b, zIndex: 50 }),
                      option: (b, s) => ({ ...b, fontSize: 14, backgroundColor: s.isSelected ? "#3b82f6" : s.isFocused ? "#f3f4f6" : "white", color: s.isSelected ? "white" : "#374151", cursor: "pointer" }),
                      indicatorSeparator: () => ({ display: "none" }),
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 lg:hidden">
                <button onClick={() => setIsFilterOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Mở bộ lọc">
                  <CiFilter className="text-2xl text-gray-700" />
                </button>
                <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Thêm địa điểm">
                  <IoIosAddCircleOutline className="text-2xl text-gray-700" />
                </button>
              </div>

              <AddPlace open={open} setOpen={setOpen} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-base lg:text-lg">
                {type === "hot" ? "Địa điểm hot" : "Tất cả"}
              </h4>
            </div>
            {/* List */}
            <div className="flex flex-col gap-4 lg:gap-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm lg:text-base">Đang tải dữ liệu...</p>
                </div>
              ) : destinations.length > 0 ? (
                destinations.map((destination) => (
                  <DestinationCard key={destination._id} destination={destination} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm lg:text-base text-gray-500">Không tìm thấy địa điểm phù hợp.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center mt-6 lg:mt-8 gap-1 lg:gap-2 flex-wrap px-2">
                <button onClick={() => handleFilterChange('page', String(Math.max(currentPage - 1, 1)))} disabled={currentPage === 1} className="px-2 lg:px-3 py-1 lg:py-2 text-sm lg:text-base border rounded-lg disabled:opacity-50 cursor-pointer">
                  Trước
                </button>

                {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                  page === "..." ? (
                    <span key={idx} className="px-3 py-1">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handleFilterChange('page', String(page))}
                      className={`px-2 lg:px-3 py-1 lg:py-2 text-sm lg:text-base border rounded-lg cursor-pointer ${currentPage === page ? "bg-primary text-white" : "bg-white hover:bg-gray-100"}`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button onClick={() => handleFilterChange('page', String(Math.min(currentPage + 1, totalPages)))} disabled={currentPage === totalPages} className="px-2 lg:px-3 py-1 lg:py-2 text-sm lg:text-base border rounded-lg disabled:opacity-50 cursor-pointer">
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
