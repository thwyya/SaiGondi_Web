'use client';

import { useState, useEffect } from 'react';
import { Filter, MapPin, Star, FolderOpen, Calendar, X, RotateCcw } from 'lucide-react';
import FilterDropdown from '@/shared/Filter';
import { wardApi } from '@/lib/ward/wardApi';
import { Ward } from '@/types/ward';

export interface FilterState {
    blogSort?: string;
    blogCategory?: string;
    destRating?: string;
    destWard?: string;
    placeCategory?: string;
}

interface SearchFilterProps {
    filters: Partial<FilterState>;
    filterType: 'all' | 'destinations' | 'blogs';
    onFilterChange: (filters: Partial<FilterState>) => void;
    blogCategories: { id: string; name: string; }[];
    placeCategories: { id: string; name: string; }[];
}

const blogSortOptions = [
    { label: 'Bài viết mới nhất', value: 'newest' },
    { label: 'Bài viết cũ nhất', value: 'createdAt,asc' },
    { label: 'Tương tác nhiều nhất', value: 'popular' },
    { label: 'Tương tác ít nhất', value: 'views,asc' }
];

const SearchFilter = ({
    filters,
    filterType,
    onFilterChange,
    blogCategories,
    placeCategories
}: SearchFilterProps) => {
    const [wards, setWards] = useState<Ward[]>([]);
    const [internalFilterType, setInternalFilterType] = useState(filterType);
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);

    useEffect(() => {
        // Reset filters when the filter type changes (e.g., switching from "destinations" to "blogs")
        if (internalFilterType !== filterType) {
            onFilterChange({
                blogSort: undefined,
                blogCategory: undefined,
                destRating: undefined,
                destWard: undefined,
                placeCategory: undefined
            });
        }
        setInternalFilterType(filterType);
    }, [filterType, internalFilterType, onFilterChange]);

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

    useEffect(() => {
        const active: string[] = [];
        if (filters.blogSort) {
            const sortLabel = blogSortOptions.find(o => o.value === filters.blogSort)?.label;
            if (sortLabel) active.push(sortLabel);
        }
        if (filters.blogCategory) {
            const catName = blogCategories.find(c => c.id === filters.blogCategory)?.name;
            if (catName) active.push(catName);
        }
        if (filters.placeCategory) {
            const catName = placeCategories.find(c => c.id === filters.placeCategory)?.name;
            if (catName) active.push(catName);
        }
        if (filters.destRating) active.push(`${filters.destRating} sao`);
        if (filters.destWard) {
            active.push(filters.destWard);
        }
        setActiveFilters(active);
    }, [filters, blogCategories, placeCategories, wards]);

    const handleFilterUpdate = (newFilter: Partial<FilterState>) => {
        const updatedFilters = { ...filters, ...newFilter };
        onFilterChange(updatedFilters);
    }

    const handleResetFilters = () => {
        onFilterChange({});
    };

    const removeFilter = (filterToRemove: string) => {
        const updatedFilters = { ...filters };

        const sortOption = blogSortOptions.find(o => o.label === filterToRemove);
        if (sortOption && sortOption.value === filters.blogSort) {
            updatedFilters.blogSort = undefined;
        }

        if (blogCategories.find(c => c.name === filterToRemove)?.id === filters.blogCategory) {
            updatedFilters.blogCategory = undefined;
        }
        if (placeCategories.find(c => c.name === filterToRemove)?.id === filters.placeCategory) {
            updatedFilters.placeCategory = undefined;
        }
        if (`${filters.destRating} sao` === filterToRemove) {
            updatedFilters.destRating = undefined;
        }
        if (filters.destWard === filterToRemove) {
            updatedFilters.destWard = undefined;
        }

        onFilterChange(updatedFilters);
    };


    const wardNames = wards.map(w => w.name);
    const destRatingOptions = ['5', '4', '3', '2', '1'].map(r => `${r} sao`);
    //iocn dưới header bộ lọc 
    const FilterSection = ({ title, icon: Icon, gradient, children }: { title: string; icon: any; gradient: string; children: React.ReactNode; }) => (
        <div className="space-y-4 animate-fadeIn ">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-100">
                <div className={`p-2 ${gradient} rounded-lg shadow-sm`}><Icon className="w-4 h-4 text-white" /></div>
                <span className="text-sm font-semibold text-gray-800">{title}</span>
            </div>
            <div className="space-y-3 pl-2">{children}</div>
        </div>
    );
    // lable Danh mục địa điểm ở bộ lọc     
    const FilterGroup = ({ label, icon: Icon, children }: { label: string; icon: any; children: React.ReactNode; }) => (
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

        const createCategoryHandler = (filterKey: keyof FilterState, categories: {id: string, name: string}[], resetValue: string) => (value: string) => {
            if (value === resetValue) {
                handleFilterUpdate({ [filterKey]: undefined });
            } else {
                const selectedId = categories.find(c => c.name === value)?.id;
                handleFilterUpdate({ [filterKey]: selectedId });
            }
        };

        const handleWardChange = (value: string) => {
            if (value === 'Tất cả khu vực') {
                handleFilterUpdate({ destWard: undefined });
            } else {
                handleFilterUpdate({ destWard: value });
            }
        };
        // Tab bài viết 
        if (currentType === 'blogs') {
            return (
                <FilterSection title="Bộ lọc Bài viết" icon={FolderOpen} gradient="bg-gradient-to-br from-blue-400 to-cyan-400">
                    <FilterGroup label="Sắp xếp theo" icon={Calendar}>
                        <FilterDropdown
                            options={['Chọn thứ tự', ...blogSortOptions.map(o => o.label)]}
                            value={blogSortOptions.find(o => o.value === filters.blogSort)?.label || 'Chọn thứ tự'}
                            onChange={(selectedLabel) => {
                                if (selectedLabel === 'Chọn thứ tự') {
                                    handleFilterUpdate({ blogSort: undefined });
                                } else {
                                    const selectedValue = blogSortOptions.find(o => o.label === selectedLabel)?.value;
                                    handleFilterUpdate({ blogSort: selectedValue });
                                }
                            }}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                    <FilterGroup label="Danh mục" icon={FolderOpen}>
                        <FilterDropdown
                            options={['Tất cả danh mục', ...blogCategories.map(c => c.name)]}
                            value={blogCategories.find(c => c.id === filters.blogCategory)?.name || 'Tất cả danh mục'}
                            onChange={createCategoryHandler('blogCategory', blogCategories, 'Tất cả danh mục')}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                </FilterSection>
            );
        }
        // tab địa điểm 
        else if (currentType === 'destinations') {
            return (
                <FilterSection title="Bộ lọc Địa điểm" icon={MapPin} gradient="bg-gradient-to-br from-emerald-500 to-teal-600">
                    <FilterGroup label="Danh mục địa điểm" icon={FolderOpen}>
                        <FilterDropdown
                            options={['Tất cả danh mục', ...placeCategories.map(c => c.name)]}
                            value={placeCategories.find(c => c.id === filters.placeCategory)?.name || 'Tất cả danh mục'}
                            onChange={createCategoryHandler('placeCategory', placeCategories, 'Tất cả danh mục')}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                    <FilterGroup label="Đánh giá" icon={Star}>
                        <FilterDropdown
                            options={['Tất cả đánh giá', ...destRatingOptions]}
                            value={filters.destRating ? `${filters.destRating} sao` : 'Tất cả đánh giá'}
                            onChange={(value) => handleFilterUpdate({ destRating: value === 'Tất cả đánh giá' ? undefined : value.split(' ')[0] })}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                    {/* // */}
                    <FilterGroup label="Khu vực" icon={MapPin}>
                        <FilterDropdown
                            options={['Tất cả khu vực', ...wardNames]}
                            value={filters.destWard || 'Tất cả khu vực'}
                            onChange={handleWardChange}
                            className={dropdownClassName}
                            isSearchable={true}
                        />
                    </FilterGroup>
                </FilterSection>
            );
        }

        return (
            <div className="space-y-6 animate-fadeIn">
                <FilterSection title="Bộ lọc Địa điểm" icon={MapPin} gradient="bg-gradient-to-br from-emerald-500 to-teal-600">
                    <FilterGroup label="Danh mục địa điểm" icon={FolderOpen}>
                        <FilterDropdown
                            options={['Tất cả danh mục', ...placeCategories.map(c => c.name)]}
                            value={placeCategories.find(c => c.id === filters.placeCategory)?.name || 'Tất cả danh mục'}
                            onChange={createCategoryHandler('placeCategory', placeCategories, 'Tất cả danh mục')}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                    <FilterGroup label="Đánh giá" icon={Star}>
                        <FilterDropdown
                            options={['Tất cả đánh giá', ...destRatingOptions]}
                            value={filters.destRating ? `${filters.destRating} sao` : 'Tất cả đánh giá'}
                            onChange={(value) => handleFilterUpdate({ destRating: value === 'Tất cả đánh giá' ? undefined : value.split(' ')[0] })}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                    <FilterGroup label="Khu vực" icon={MapPin}>
                        <FilterDropdown
                            options={['Tất cả khu vực', ...wardNames]}
                            value={filters.destWard || 'Tất cả khu vực'}
                            onChange={handleWardChange}
                            className={dropdownClassName}
                            isSearchable={true}
                        />
                    </FilterGroup>
                </FilterSection>

                <FilterSection title="Bộ lọc Bài viết" icon={FolderOpen} gradient="bg-gradient-to-br from-blue-400 to-cyan-400">
                    <FilterGroup label="Sắp xếp theo" icon={Calendar}>
                        <FilterDropdown
                            options={['Chọn thứ tự', ...blogSortOptions.map(o => o.label)]}
                            value={blogSortOptions.find(o => o.value === filters.blogSort)?.label || 'Chọn thứ tự'}
                            onChange={(selectedLabel) => {
                                if (selectedLabel === 'Chọn thứ tự') {
                                    handleFilterUpdate({ blogSort: undefined });
                                } else {
                                    const selectedValue = blogSortOptions.find(o => o.label === selectedLabel)?.value;
                                    handleFilterUpdate({ blogSort: selectedValue });
                                }
                            }}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                    <FilterGroup label="Danh mục bài viết" icon={FolderOpen}>
                        <FilterDropdown
                            options={['Tất cả danh mục', ...blogCategories.map(c => c.name)]}
                            value={blogCategories.find(c => c.id === filters.blogCategory)?.name || 'Tất cả danh mục'}
                            onChange={createCategoryHandler('blogCategory', blogCategories, 'Tất cả danh mục')}
                            className={dropdownClassName}
                        />
                    </FilterGroup>
                </FilterSection>
            </div>
        );
    };
    // bộ lọc " Header "
    return (
        <div className="w-full relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-pink-50 rounded-2xl blur-2xl opacity-60"></div>
            <div className="relative bg-white/90 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-2xl shadow-blue-100/30 hover:shadow-2xl hover:shadow-cyan-100/40 transition-all duration-500">
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
                        <button onClick={handleResetFilters} disabled={activeFilters.length === 0} className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200" title="Đặt lại bộ lọc">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
                            <div className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>▼</div>
                        </button>
                    </div>
                </div>

                {activeFilters.length > 0 && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {activeFilters.map((filter, index) => (
                                <span key={index} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-blue-200 rounded-full text-xs font-medium text-blue-700 shadow-sm">
                                    {filter}
                                    <button onClick={() => removeFilter(filter)} className="hover:text-blue-900 transition-colors duration-200">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                    {renderFilters()}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Đang áp dụng {activeFilters.length} bộ lọc</span>
                        {activeFilters.length > 0 && (
                            <button onClick={handleResetFilters} className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                                Xóa tất cả
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); }
            `}</style>
        </div>
    );
};

export default SearchFilter;