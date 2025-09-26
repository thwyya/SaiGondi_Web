'use client';

import React, { useState, useEffect } from 'react';
import { categoryApi } from '@/lib/category/categoryApi';
import { Category } from '@/types/category';

export interface BlogFilters {
  category: string;
}

interface BlogFilterPanelProps {
  filters: BlogFilters;
  onFilterChange: (newFilters: Partial<BlogFilters>) => void;
  onApplyFilters: () => void;
}

const BlogFilterPanel: React.FC<BlogFilterPanelProps> = ({ filters, onFilterChange, onApplyFilters }) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-center gap-4">
      <h3 className="text-lg font-semibold mr-4">Lọc bài viết</h3>
      
      {/* Category Filter */}
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700">Chuyên mục</label>
        <select 
          id="category-filter"
          name="category"
          value={filters.category}
          onChange={handleSelectChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Tất cả</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <button
        onClick={onApplyFilters}
        className="ml-auto bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors"
      >
        Áp dụng
      </button>
    </div>
  );
};

export default BlogFilterPanel;
