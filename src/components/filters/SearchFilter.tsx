'use client';

import { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, MapPin, Star, FolderOpen, Calendar, TrendingUp } from 'lucide-react';
import FilterDropdown from '@/shared/Filter';
import { categoryApi } from '@/lib/category/categoryApi';
import { wardApi } from '@/lib/ward/wardApi';
import { Category } from '@/types/category';
import { Ward } from '@/types/ward';

export interface FilterState {
    blogSort: string;
    blogCategory: string;
    destRating: string;
    destCategory: string;
    destWard: string;
}

interface SearchFilterProps {
    filterType: 'all' | 'destinations' | 'blogs';
    onFilterChange: (filters: Partial<FilterState>) => void;
}

const SearchFilter = ({ filterType, onFilterChange }: SearchFilterProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [internalFilterType, setInternalFilterType] = useState(filterType);

    useEffect(() => {
        setInternalFilterType(filterType);
    }, [filterType]);

    const [filters, setFilters] = useState<Partial<FilterState>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, wardRes] = await Promise.all([
                    categoryApi.getAllCategories(),
                    wardApi.getAll(),
                ]);
                setCategories(catRes || []);
                setWards(Array.isArray(wardRes) ? wardRes : wardRes?.data || []);
            } catch (error) {
                console.error("Failed to fetch filter data:", error);
            }
        };
        fetchData();
    }, []);

    const handleFilterUpdate = (newFilter: Partial<FilterState>) => {
        const updatedFilters = { ...filters, ...newFilter };
        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    }

    const blogCategories = categories.filter(c => c.type === 'Blog').map(c => c.name);
    const destCategories = categories.filter(c => c.type === 'Destination').map(c => c.name);
    const wardNames = wards.map(w => w.name);

    const blogSortOptions = ['Bài viết mới nhất', 'Bài viết cũ nhất', 'Tương tác nhiều nhất', 'Tương tác ít nhất'];
    const destRatingOptions = ['5', '4', '3', '2', '1'].map(r => `${r} sao`);

    const renderFilters = () => {
        const dropdownClassName = "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200";

        const currentType = internalFilterType;

        if (currentType === 'blogs') {
            return (
                <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                            <FolderOpen className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Bộ lọc Bài viết</span>
                    </div>
                    
                    <div className="group">
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            Sắp xếp theo
                        </label>
                        <FilterDropdown 
                            options={blogSortOptions} 
                            value={filters.blogSort || 'Chọn thứ tự'} 
                            onChange={(value) => handleFilterUpdate({ blogSort: value })} 
                            className={dropdownClassName}
                        />
                    </div>

                    <div className="group">
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1.5">
                            <FolderOpen className="w-3.5 h-3.5" />
                            Danh mục
                        </label>
                        <FilterDropdown 
                            options={blogCategories} 
                            value={filters.blogCategory || 'Tất cả danh mục'} 
                            onChange={(value) => handleFilterUpdate({ blogCategory: value })} 
                            className={dropdownClassName}
                        />
                    </div>
                </div>
            );
        }

        if (currentType === 'destinations') {
            return (
                <div className="space-y-3 animate-fadeIn">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                            <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Bộ lọc Địa điểm</span>
                    </div>

                    <div className="group">
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1.5">
                            <FolderOpen className="w-3.5 h-3.5" />
                            Danh mục
                        </label>
                        <FilterDropdown 
                            options={destCategories} 
                            value={filters.destCategory || 'Tất cả danh mục'} 
                            onChange={(value) => handleFilterUpdate({ destCategory: value })} 
                            className={dropdownClassName}
                        />
                    </div>

                    <div className="group">
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1.5">
                            <Star className="w-3.5 h-3.5" />
                            Đánh giá
                        </label>
                        <FilterDropdown 
                            options={destRatingOptions} 
                            value={filters.destRating ? `${filters.destRating} sao` : 'Tất cả đánh giá'} 
                            onChange={(value) => handleFilterUpdate({ destRating: value.split(' ')[0] })} 
                            className={dropdownClassName}
                        />
                    </div>

                    <div className="group">
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            Khu vực
                        </label>
                        <FilterDropdown 
                            options={wardNames} 
                            value={filters.destWard || 'Tất cả khu vực'} 
                            onChange={(value) => handleFilterUpdate({ destWard: value })} 
                            className={dropdownClassName}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-3 animate-fadeIn">
                <div className="text-center mb-6">
                    <div className="inline-flex p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-3">
                        <SlidersHorizontal className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Chọn loại nội dung để lọc</p>
                    <p className="text-xs text-gray-500 mt-1">Tìm kiếm chính xác hơn với bộ lọc chi tiết</p>
                </div>
                
                <button 
                    onClick={() => setInternalFilterType('destinations')} 
                    className="group w-full relative overflow-hidden px-5 py-4 border-2 border-emerald-200 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-gray-800">Địa điểm</div>
                                <div className="text-xs text-gray-600 font-normal">Lọc theo vị trí & đánh giá</div>
                            </div>
                        </div>
                        <div className="text-emerald-600 group-hover:translate-x-1 transition-transform duration-300">→</div>
                    </div>
                </button>

                <button 
                    onClick={() => setInternalFilterType('blogs')} 
                    className="group w-full relative overflow-hidden px-5 py-4 border-2 border-blue-200 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                <FolderOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-gray-800">Bài viết</div>
                                <div className="text-xs text-gray-600 font-normal">Lọc theo danh mục & thời gian</div>
                            </div>
                        </div>
                        <div className="text-blue-600 group-hover:translate-x-1 transition-transform duration-300">→</div>
                    </div>
                </button>
            </div>
        );
    };

    return (
        <div className="w-full relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl blur-xl opacity-30"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-200">
                    <div className="p-2.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-md">
                        <Filter className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Bộ lọc tìm kiếm
                    </h3>
                </div>
                {renderFilters()}
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default SearchFilter;