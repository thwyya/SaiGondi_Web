'use client';
import { exportToExcel } from '@/lib/export';
import React, { useState } from 'react';
import SearchBar from '../SearchBar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CategoryTable } from './CategoryTable';
import AddCategoryPopup from './AddCategoryPopup';
import FilterDropdown from '@/shared/Filter';
import { createCategory, getCategories, updateCategory, deleteCategory } from '@/services/categoryService';
import ConfirmationDialog from './ConfirmationDialog';
import { Category } from '@/types/category';

export default function CategoriesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [filter, setFilter] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsAddOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDeletingCategoryId(null);
    },
  });

  const handleSave = (category: { id?: string; name: string; description: string; type: string }) => {
    if (category.id) {
      const { id, ...rest } = category;
      updateMutation.mutate({ id, category: rest });
    } else {
      createMutation.mutate(category);
    }
  };

  const filteredData = data?.filter(category => {
    const typeFilter =
      filter === 'Tất cả' ||
      (filter === 'Địa điểm' && category.type === 'place') ||
      (filter === 'Bài Viết' && category.type === 'blog');

    const searchFilter =
      searchTerm === '' ||
      category.name.toLowerCase().includes(searchTerm.toLowerCase());

    return typeFilter && searchFilter;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredData?.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData?.map((d) => d.id) ?? []));
    }
  };

  const handleExport = () => {
    const dataToExport = selectedIds.size > 0
      ? data?.filter(category => selectedIds.has(category.id))
      : filteredData;

    if (dataToExport) {
      exportToExcel(dataToExport, 'categories');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <>
      {(isAddOpen || editingCategory) && (
        <AddCategoryPopup
          onClose={() => {
            setIsAddOpen(false);
            setEditingCategory(null);
          }}
          onSave={handleSave}
          category={editingCategory}
        />
      )}
      {deletingCategoryId && (
        <ConfirmationDialog
          message="Bạn có chắc chắn muốn xóa danh mục này?"
          onConfirm={() => deleteMutation.mutate(deletingCategoryId)}
          onCancel={() => setDeletingCategoryId(null)}
        />
      )}
      <div className="flex flex-col my-12 mx-6">
        <div id="title">
          <h1>QUẢN LÝ DANH MỤC</h1>
          <div className="flex justify-between items-end ">
            <div id="group__1" className='flex'>
              <h4>Admin</h4>
              <i className="ri-arrow-right-s-line"></i>
              <h4>QUẢN LÝ DANH MỤC</h4>
            </div>
            <div id="group__btn" className='gap-2 flex'>
              <button onClick={handleExport} className=' flex bg-[#DEDEFA] text-(--primary) gap-2 p-2 rounded-md'>
                <i className="ri-upload-cloud-line"></i>
                <h4>Xuất file</h4>
              </button>
              <button onClick={() => setIsAddOpen(true)} className="flex btn-primary text-white gap-2 p-2 rounded-md">
                <i className="ri-add-line"></i>
                <h4>Thêm Danh mục</h4>
              </button>
            </div>
          </div>
        </div>

        <SearchBar
          placeholder='Tìm kiếm danh mục....'
          onSearch={setSearchTerm}
          filterSlot={
            <FilterDropdown
              options={['Tất cả', 'Địa điểm', 'Bài Viết']}
              value={filter}
              onChange={setFilter}
            />
          }
        />

        <CategoryTable
          data={filteredData ?? []}
          onEdit={setEditingCategory}
          onDelete={setDeletingCategoryId}
          selectedIds={selectedIds}
          onSelect={toggleSelect}
          onSelectAll={toggleSelectAll}
        />
      </div>
    </>
  );
}