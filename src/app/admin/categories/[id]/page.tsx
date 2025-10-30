'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategoryById, updateCategory, deleteCategory } from '@/services/categoryService';
import { useParams, useRouter } from 'next/navigation';
import ItemDetailsPopup from './ItemDetailsPopup';


export default function CategoryDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const { data: category, isLoading: isLoadingCategory, error: categoryError } = useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategoryById(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (category) {
      setFormData({ name: category.name, description: category.description || '' });
    }
  }, [category]);

  const updateMutation = useMutation({
    mutationFn: (updatedData: { name: string; description: string }) => 
      updateCategory({ id, category: { ...updatedData, type: category!.type } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['category', id] });
      setNotification({ type: 'success', message: 'Cập nhật danh mục thành công!' });
      setIsEditing(false);
      setTimeout(() => setNotification(null), 3000);
    },
    onError: () => {
      setNotification({ type: 'error', message: 'Lỗi khi cập nhật danh mục.' });
      setTimeout(() => setNotification(null), 3000);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.push('/admin/categories');
    },
    onError: () => {
      setNotification({ type: 'error', message: 'Lỗi khi xóa danh mục.' });
      setTimeout(() => setNotification(null), 3000);
    },
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này không? Hành động này không thể hoàn tác.')) {
      deleteMutation.mutate();
    }
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedItem(null);
  };

  if (isLoadingCategory) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (categoryError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <i className="ri-error-warning-line text-5xl text-red-500 mb-4"></i>
          <p className="text-red-600 font-semibold">Lỗi khi tải thông tin danh mục</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-gray-50 p-8 rounded-lg">
          <i className="ri-folder-unknow-line text-5xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 font-semibold">Không tìm thấy danh mục</p>
        </div>
      </div>
    );
  }

  const items = category.type === 'blog' ? category.blogs : category.places;
  const filteredItems = items?.filter((item: any) => {
    const searchValue = category.type === 'blog' ? item.title : item.name;
    return searchValue.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <span className="hover:text-blue-600 cursor-pointer transition">Admin</span>
            <i className="ri-arrow-right-s-line mx-2"></i>
            <span className="hover:text-blue-600 cursor-pointer transition">Quản lý danh mục</span>
            <i className="ri-arrow-right-s-line mx-2"></i>
            <span className="text-gray-900 font-medium">{category.name}</span>
          </div>

          {/* Title and Stats */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{category.name}</h1>
              <p className="text-gray-600 text-lg">{category.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                category.type === 'blog' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                <i className={`${category.type === 'blog' ? 'ri-article-line' : 'ri-map-pin-line'} mr-1`}></i>
                {category.type === 'blog' ? 'Bài viết' : 'Địa điểm'}
              </span>
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                <i className="ri-list-check mr-1"></i>
                {items?.length || 0} mục
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {notification && (
          <div
            className={`p-4 mb-6 rounded-lg flex justify-between items-center shadow-md ${
              notification.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <p>{notification.message}</p>
            <button onClick={() => setNotification(null)} className="text-xl font-bold">&times;</button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Items List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="relative">
                <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
                <input
                  type="text"
                  placeholder={`Tìm kiếm ${category.type === 'blog' ? 'bài viết' : 'địa điểm'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Items Grid */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <i className={`${category.type === 'blog' ? 'ri-article-line' : 'ri-map-pin-line'} mr-3 text-blue-600`}></i>
                  {category.type === 'blog' ? 'Bài viết' : 'Địa điểm'} liên quan
                </h2>
                <p className="text-gray-600 mt-1">
                  Tìm thấy {filteredItems?.length || 0} kết quả
                </p>
              </div>

              <div className="p-6">
                {filteredItems && filteredItems.length > 0 ? (
                  <div className="space-y-3">
                    {filteredItems.map((item: any, index: number) => (
                      <div
                        key={item._id}
                        onClick={() => handleItemClick(item)}
                        className="group flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer bg-white hover:bg-blue-50"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                              {category.type === 'blog' ? item.title : item.name}
                            </h3>
                            {item.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <i className="ri-arrow-right-line text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"></i>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <i className={`${category.type === 'blog' ? 'ri-article-line' : 'ri-map-pin-line'} text-6xl text-gray-300 mb-4`}></i>
                    <p className="text-gray-500 text-lg">
                      {searchTerm 
                        ? 'Không tìm thấy kết quả phù hợp' 
                        : `Chưa có ${category.type === 'blog' ? 'bài viết' : 'địa điểm'} nào`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Category Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <i className={`mr-3 text-indigo-600 ${isEditing ? 'ri-edit-box-line' : 'ri-information-line'}`}></i>
                  {isEditing ? 'Chỉnh sửa danh mục' : 'Thông tin chi tiết'}
                </h2>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdate} className="p-6 space-y-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-500">
                      <i className="ri-price-tag-3-line mr-2"></i>
                      Tên danh mục
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>

                  {/* Description Input */}
                  <div className="space-y-2">
                    <label htmlFor="description" className="flex items-center text-sm font-medium text-gray-500">
                      <i className="ri-file-text-line mr-2"></i>
                      Mô tả
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                    ></textarea>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <button 
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {updateMutation.isPending ? (
                        <>
                          <i className="ri-loader-4-line animate-spin mr-2"></i>
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <i className="ri-save-line mr-2"></i>
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition flex items-center justify-center"
                    >
                      Hủy
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <i className="ri-price-tag-3-line mr-2"></i>
                      Tên danh mục
                    </div>
                    <p className="text-gray-900 font-semibold pl-6">{category.name}</p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <i className="ri-file-text-line mr-2"></i>
                      Mô tả
                    </div>
                    <p className="text-gray-700 pl-6 leading-relaxed">
                      {category.description || 'Không có mô tả'}
                    </p>
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <i className="ri-layout-grid-line mr-2"></i>
                      Loại danh mục
                    </div>
                    <p className="pl-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        category.type === 'blog' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        <i className={`${category.type === 'blog' ? 'ri-article-line' : 'ri-map-pin-line'} mr-1`}></i>
                        {category.type === 'blog' ? 'Bài viết' : 'Địa điểm'}
                      </span>
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Created Date */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <i className="ri-calendar-line mr-2"></i>
                      Ngày tạo
                    </div>
                    <p className="text-gray-700 pl-6">
                      {new Date(category.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Updated Date */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <i className="ri-refresh-line mr-2"></i>
                      Cập nhật lần cuối
                    </div>
                    <p className="text-gray-700 pl-6">
                      {new Date(category.updatedAt).toLocaleDateString('vi-VN', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Statistics */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Tổng số mục</p>
                          <p className="text-3xl font-bold text-blue-600 mt-1">{items?.length || 0}</p>
                        </div>
                        <i className="ri-bar-chart-box-line text-4xl text-blue-400"></i>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition flex items-center justify-center"
                    >
                      <i className="ri-edit-line mr-2"></i>
                      Chỉnh sửa danh mục
                    </button>
                    <button 
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition flex items-center justify-center disabled:bg-gray-200 disabled:cursor-not-allowed"
                    >
                      {deleteMutation.isPending ? (
                        <>
                          <i className="ri-loader-4-line animate-spin mr-2"></i>
                          Đang xóa...
                        </>
                      ) : (
                        <>
                          <i className="ri-delete-bin-line mr-2"></i>
                          Xóa danh mục
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {isPopupOpen && selectedItem && (
        <ItemDetailsPopup
          item={selectedItem}
          itemType={category.type as 'blog' | 'place'}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}
