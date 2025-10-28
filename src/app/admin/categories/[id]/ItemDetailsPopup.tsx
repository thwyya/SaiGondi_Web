
'use client';
import React from 'react';

interface ItemDetailsPopupProps {
  item: any;
  itemType: 'blog' | 'place';
  onClose: () => void;
}

export default function ItemDetailsPopup({ item, itemType, onClose }: ItemDetailsPopupProps) {
  if (!item) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 transform transition-all duration-300 ease-out animate-slide-up"
        onClick={(e) => e.stopPropagation()} 
      >
        
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-8 py-5 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{itemType === 'blog' ? item.title : item.name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Chi tiết {itemType === 'blog' ? 'bài viết' : 'địa điểm'}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors rounded-full w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200">
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>

    
        <div className="p-8">
          {itemType === 'blog' ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider mb-2 flex items-center"><i className="ri-file-text-line mr-2"></i>Nội dung</h3>
                <div 
                  className="prose prose-lg max-w-none text-gray-800 leading-relaxed" 
                  dangerouslySetInnerHTML={{ __html: item.content || 'Không có nội dung.' }}
                ></div>
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider mb-4 flex items-center"><i className="ri-user-line mr-2"></i>Tác giả</h3>
                <div className="flex items-center space-x-4">
                  <img src={item.author?.avatar || '/avatar.svg'} alt={item.author?.name} className="w-12 h-12 rounded-full object-cover"/>
                  <div>
                    <p className="font-semibold text-gray-900">{item.author?.name || 'Không rõ'}</p>
                    <p className="text-sm text-gray-500">{item.author?.email || ''}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider mb-2 flex items-center"><i className="ri-map-pin-line mr-2"></i>Địa chỉ</h3>
                <p className="text-gray-800 text-lg">{item.address || 'Chưa cập nhật'}</p>
              </div>
              {item.description && (
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider mb-2 flex items-center"><i className="ri-information-line mr-2"></i>Mô tả</h3>
                  <p className="text-gray-800 leading-relaxed">{item.description}</p>
                </div>
              )}
              {item.images && item.images.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-500 text-sm uppercase tracking-wider mb-4 flex items-center"><i className="ri-image-line mr-2"></i>Hình ảnh</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {item.images.map((image: string, index: number) => (
                      <div key={index} className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img src={image} alt={`${item.name} image ${index + 1}`} className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"/>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-8 py-4">
            <div className="text-sm text-gray-500 flex items-center">
                <i className="ri-calendar-line mr-2"></i>
                <span>Ngày tạo: </span>
                <span className="font-medium text-gray-700 ml-1">
                    {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    })}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
}

