import React, { useState, useEffect } from 'react';
import { Category } from '@/types/category';

interface AddCategoryPopupProps {
    onClose: () => void;
    onSave: (category: { id?: string; name: string; description: string; type: string }) => void;
    category?: Category | null;
}

const AddCategoryPopup: React.FC<AddCategoryPopupProps> = ({ onClose, onSave, category }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('place');

    useEffect(() => {
        if (category) {
            setName(category.name);
            setDescription(category.description);
            setType(category.type);
        } else {
            setName('');
            setDescription('');
            setType('place');
        }
    }, [category]);

    const handleSave = () => {
        if (!name.trim()) {
            alert('Vui lòng nhập tên danh mục');
            return;
        }
        onSave({ id: category?.id, name: name.trim(), description: description.trim(), type });
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-[9999]"
            onClick={handleBackdropClick}
        >
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md mx-4">
                <h2 className="text-2xl font-bold mb-4">{category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}</h2>
                
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Tên Danh Mục <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nhập tên danh mục"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        autoFocus
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Nhập mô tả (tùy chọn)"
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-none"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                        Loại Danh Mục
                    </label>
                    <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="place">Địa điểm</option>
                        <option value="blog">Bài viết</option>
                    </select>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCategoryPopup;