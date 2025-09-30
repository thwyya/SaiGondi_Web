'use client';

import React from 'react';

// Hardcoded options for now
const categories = [
  { id: '1', name: 'Nhà hàng' },
  { id: '2', name: 'Quán cà phê' },
  { id: '3', name: 'Di tích lịch sử' },
];
const districts = [
  { id: 'q1', name: 'Quận 1' },
  { id: 'q2', name: 'Quận 2' },
  { id: 'q3', name: 'Quận 3' },
];
const ratings = [
  { id: 1, name: 'Từ 1 sao' },
  { id: 2, name: 'Từ 2 sao' },
  { id: 3, name: 'Từ 3 sao' },
  { id: 4, name: 'Từ 4 sao' },
];

interface SearchFilters {
  category: string;
  district: string;
  ward: string;
  rating: number;
}

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (newFilters: Partial<SearchFilters>) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-center gap-4">
      <h3 className="text-lg font-semibold mr-4">Bộ lọc</h3>
      
      {/* Category Filter */}
      <div className="flex-1 min-w-[150px]">
        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700">Loại địa điểm</label>
        <select 
          id="category-filter"
          name="category"
          value={filters.category}
          onChange={handleSelectChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Tất cả</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* District Filter */}
      <div className="flex-1 min-w-[150px]">
        <label htmlFor="district-filter" className="block text-sm font-medium text-gray-700">Quận</label>
        <select 
          id="district-filter"
          name="district"
          value={filters.district}
          onChange={handleSelectChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Tất cả</option>
          {districts.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Ward Filter */}
      <div className="flex-1 min-w-[150px]">
        <label htmlFor="ward-filter" className="block text-sm font-medium text-gray-700">Phường</label>
        <select 
          id="ward-filter"
          name="ward"
          value={filters.ward}
          onChange={handleSelectChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          disabled={!filters.district} // Disable if no district is selected
        >
          <option value="">Tất cả</option>
          {/* This should be populated based on district selection */}
        </select>
      </div>

      {/* Rating Filter */}
      <div className="flex-1 min-w-[150px]">
        <label htmlFor="rating-filter" className="block text-sm font-medium text-gray-700">Đánh giá</label>
        <select 
          id="rating-filter"
          name="rating"
          value={filters.rating}
          onChange={handleSelectChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="0">Tất cả</option>
          {ratings.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
