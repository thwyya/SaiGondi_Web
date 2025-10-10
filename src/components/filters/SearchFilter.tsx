'use client';

import { useState, useEffect } from 'react';
import { Filter, MapPin, Star, FolderOpen, Calendar, X, RotateCcw } from 'lucide-react';
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
    placeCategory: string;
}

interface SearchFilterProps {
    filterType: 'all' | 'destinations' | 'blogs';
    onFilterChange: (filters: Partial<FilterState>) => void;
    blogCategories: { id: string; name: string; }[];
    destCategories: { id: string; name: string; }[];
    placeCategories: { id: string; name: string; }[];
}

const SearchFilter = ({
    filterType,
    onFilterChange,
    blogCategories,
    destCategories,
    placeCategories
}: SearchFilterProps) => {
    const [wards, setWards] = useState<Ward[]>([]);
    const [internalFilterType, setInternalFilterType] = useState(filterType);
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    useEffect(() => {
        setInternalFilterType(filterType);
    }, [filterType]);

    const [filters, setFilters] = useState<Partial<FilterState>>({});

    useEffect(() => {
        const fetchWards = async () => {
            try {
                const wardRes = await wardApi.getAll();
                setWards(Array.isArray(wardRes) ? wardRes : wardRes?.data || []);
            } catch (error) {
                console.error("Failed to fetch wards:", error);
            }
        };
        fetchWards();
    }, []);

    // Update active filters display
    useEffect(() => {
        const active: string[] = [];
        if (filters.blogSort && filters.blogSort !== 'Chọn thứ tự') active.push(filters.blogSort);
        if (filters.blogCategory && filters.blogCategory !== 'Tất cả danh mục') active.push(filters.blogCategory);
        if (filters.destRating) active.push(`${filters.destRating} sao`);
        if (filters.placeCategory && filters.placeCategory !== 'Tất cả danh mục') active.push(filters.placeCategory);
        if (filters.destWard && filters.destWard !== 'Tất cả khu vực') active.push(filters.destWard);
        setActiveFilters(active);
    }, [filters]);

    const handleFilterUpdate = (newFilter: Partial<FilterState>) => {
        const updatedFilters = { ...filters, ...newFilter };
        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    }

    const handleResetFilters = () => {
        const resetFilters: Partial<FilterState> = {};
        setFilters(resetFilters);
        onFilterChange(resetFilters);
        setActiveFilters([]);
    };

    const removeFilter = (filterToRemove: string) => {
        const updatedFilters = { ...filters };

        // Find which filter key contains this value
        if (filters.blogSort === filterToRemove) {
            delete updatedFilters.blogSort;
        } else if (filters.blogCategory === filterToRemove) {
            delete updatedFilters.blogCategory;
        } else if (filters.destRating === filterToRemove.split(' ')[0]) {
            delete updatedFilters.destRating;
        } else if (filters.placeCategory === filterToRemove) {
            delete updatedFilters.placeCategory;
        } else if (filters.destWard === filterToRemove) {
            delete updatedFilters.destWard;
        }

        setFilters(updatedFilters);
        onFilterChange(updatedFilters);
    };

    const wardNames = wards.map(w => w.name);

    const blogSortOptions = ['Bài viết mới nhất', 'Bài viết cũ nhất', 'Tương tác nhiều nhất', 'Tương tác ít nhất'];
    const destRatingOptions = ['5', '4', '3', '2', '1'].map(r => `${r} sao`);

    const FilterSection = ({
        title,
        icon: Icon,
        gradient,
        children
    }: {
        title: string;
        icon: any;
        gradient: string;
        children: React.ReactNode;
    }) => (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100">
                <div className={`p-2 ${gradient} rounded-lg shadow-sm`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-800">{title}</span>
            </div>
            <div className="space-y-3 pl-2">
                {children}
            </div>
        </div>
    );

    const FilterGroup = ({
        label,
        icon: Icon,
        children
    }: {
        label: string;
        icon: any;
        children: React.ReactNode;
    }) => (
        <div className="group">
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                <Icon className="w-3.5 h-3.5 text-blue-500" />
                {label}
            </label>
            {children}
        </div>
    );

    const renderFilters = () => {
        const dropdownClassName = "text-gray-700 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm";

        const currentType = internalFilterType;

        if (currentType === 'blogs') {
            return (
                <FilterSection
                    title="Bộ lọc Bài viết"
                    icon={FolderOpen}
                    gradient="bg-gradient-to-br from-blue-400 to-cyan-400"
                >
                    <FilterGroup label="Sắp xếp theo" icon={Calendar}>
                        <FilterDropdown
                            options={blogSortOptions}
                            value={filters.blogSort || 'Chọn thứ tự'}
                            onChange={(value) => handleFilterUpdate({ blogSort: value })}
                            className={dropdownClassName}
                        />
                    </FilterGroup>

                    <FilterGroup label="Danh mục" icon={FolderOpen}>
                        <FilterDropdown
                            options={blogCategories.map(c => c.name)}
                            value={filters.blogCategory || 'Tất cả danh mục'}
                            onChange={(value) => handleFilterUpdate({ blogCategory: blogCategories.find(c => c.name === value)?.id || value })}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                </FilterSection>
            );
        }

        if (currentType === 'destinations') {
            return (
                <FilterSection
                    title="Bộ lọc Địa điểm"
                    icon={MapPin}
                    gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                >
                    <FilterGroup label="Danh mục địa điểm" icon={FolderOpen}>
                        <FilterDropdown
                            options={placeCategories.map(c => c.name)}
                            value={filters.placeCategory || 'Tất cả danh mục'}
                            onChange={(value) => handleFilterUpdate({ placeCategory: placeCategories.find(c => c.name === value)?.id || value })}
                            className={dropdownClassName}
                        />
                    </FilterGroup>

                    <FilterGroup label="Đánh giá" icon={Star}>
                        <FilterDropdown
                            options={destRatingOptions}
                            value={filters.destRating ? `${filters.destRating} sao` : 'Tất cả đánh giá'}
                            onChange={(value) => handleFilterUpdate({ destRating: value.split(' ')[0] })}
                            className={dropdownClassName}
                        />
                    </FilterGroup>

                    <FilterGroup label="Khu vực" icon={MapPin}>
                        <FilterDropdown
                            options={wardNames}
                            value={filters.destWard || 'Tất cả khu vực'}
                            onChange={(value) => handleFilterUpdate({ destWard: value })}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                </FilterSection>
            );
        }

        return (
            <div className="space-y-6 animate-fadeIn">
                {/* Destination Filters */}
                <FilterSection
                    title="Bộ lọc Địa điểm"
                    icon={MapPin}
                    gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                >
                    <FilterGroup label="Danh mục địa điểm" icon={FolderOpen}>
                        <FilterDropdown
                            options={placeCategories.map(c => c.name)}
                            value={filters.placeCategory || 'Tất cả danh mục'}
                            onChange={(value) => handleFilterUpdate({ placeCategory: placeCategories.find(c => c.name === value)?.id || value })}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                    <FilterGroup label="Đánh giá" icon={Star}>
                        <FilterDropdown
                            options={destRatingOptions}
                            value={filters.destRating ? `${filters.destRating} sao` : 'Tất cả đánh giá'}
                            onChange={(value) => handleFilterUpdate({ destRating: value.split(' ')[0] })}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                    <FilterGroup label="Khu vực" icon={MapPin}>
                        <FilterDropdown
                            options={wardNames}
                            value={filters.destWard || 'Tất cả khu vực'}
                            onChange={(value) => handleFilterUpdate({ destWard: value })}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                </FilterSection>

                {/* Blog Filters */}
                <FilterSection
                    title="Bộ lọc Bài viết"
                    icon={FolderOpen}
                    gradient="bg-gradient-to-br from-blue-400 to-cyan-400"
                >
                    <FilterGroup label="Sắp xếp theo" icon={Calendar}>
                        <FilterDropdown
                            options={blogSortOptions}
                            value={filters.blogSort || 'Chọn thứ tự'}
                            onChange={(value) => handleFilterUpdate({ blogSort: value })}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                    <FilterGroup label="Danh mục bài viết" icon={FolderOpen}>
                        <FilterDropdown
                            options={blogCategories.map(c => c.name)}
                            value={filters.blogCategory || 'Tất cả danh mục'}
                            onChange={(value) => handleFilterUpdate({ blogCategory: blogCategories.find(c => c.name === value)?.id || value })}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                </FilterSection>
            </div>
        );
    };

    return (
        <div className="w-full relative">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-pink-50 rounded-2xl blur-2xl opacity-60"></div>

            <div className="relative bg-white/90 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl shadow-blue-100/30 hover:shadow-2xl hover:shadow-cyan-100/40 transition-all duration-500">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg shadow-blue-500/25">
                            <Filter className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                Bộ lọc tìm kiếm
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                                Tinh chỉnh kết quả tìm kiếm của bạn
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleResetFilters}
                            disabled={activeFilters.length === 0}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                            title="Đặt lại bộ lọc"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                            <div className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                ▼
                            </div>
                        </button>
                    </div>
                </div>

                {/* Active Filters */}
                {activeFilters.length > 0 && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {activeFilters.map((filter, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 rounded-full text-xs font-medium text-blue-700 shadow-sm"
                                >
                                    {filter}
                                    <button
                                        onClick={() => removeFilter(filter)}
                                        className="hover:text-blue-900 transition-colors duration-200"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filter Content */}
                <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    {renderFilters()}
                </div>

                {/* Footer Stats */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Đang áp dụng {activeFilters.length} bộ lọc</span>
                        {activeFilters.length > 0 && (
                            <button
                                onClick={handleResetFilters}
                                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                            >
                                Xóa tất cả
                            </button>
                        )}
                    </div>
                </div>
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
                    animation: fadeIn 0.4s ease-out;
                }
                
                /* Smooth shadow transitions */
                .shadow-2xl {
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
};

export default SearchFilter;