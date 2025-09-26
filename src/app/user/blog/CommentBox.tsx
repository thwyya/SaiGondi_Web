'use client';

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { blogCommentApi } from '@/lib/blogComment/blogCommentApi';
import { FaRegImage } from 'react-icons/fa6';
import { FiX } from 'react-icons/fi';
import { BlogComment } from '@/types/blogComment';

type CommentBoxProps = {
  blogId: string;
  onCommentAdded?: (comment: any) => void; // callback để update list
  onCommentUpdated?: (comment: any) => void;
  editingComment?: BlogComment | null;
  onCancelEdit?: () => void;  
};

const CommentBox = ({ blogId, onCommentAdded, onCommentUpdated, editingComment, onCancelEdit }: CommentBoxProps) => {
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]); // ảnh cũ từ BE
  const [loading, setLoading] = useState(false);

  // Khi chuyển sang chế độ sửa thì load sẵn nội dung
  useEffect(() => {
    if (editingComment) {
      setComment(editingComment.comment);
      setImages([]); 
      setPreviewImages(editingComment.images || []);
    } else {
      setComment('');
      setImages([]);
      setPreviewImages([]);
    }
  }, [editingComment]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPreviewImages([]); // Xóa ảnh cũ khi chọn ảnh mới
      setImages(Array.from(e.target.files));
    }
  };

  const handleRemoveImage = (index: number, type: 'preview' | 'new') => {
    if (type === 'preview') {
      setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim() && images.length === 0 && previewImages.length === 0) return;

    try {
      setLoading(true);

      let result;
      if (editingComment) {
        // --- Sửa comment ---
        if (images.length > 0) {
          // Có ảnh mới => gửi ảnh mới
          result = await blogCommentApi.updateComment(editingComment._id, comment, images);
        } else {
          // Không chọn ảnh mới => vẫn giữ ảnh cũ
          result = await blogCommentApi.updateComment(editingComment._id, comment);
          result.images = previewImages; // giữ lại preview
        }
        onCommentUpdated?.(result);
      } else {
        // --- Tạo comment mới ---
        result = await blogCommentApi.createComment(blogId, comment, images);
        onCommentAdded?.(result);
      }

      setComment('');
      setImages([]);
      setPreviewImages([]);
    } catch (err) {
      console.error('Lỗi khi gửi bình luận:', err);
    } finally {
      setLoading(false);
      if (editingComment) onCancelEdit?.();
    }
  };

  return (
    <div className="pt-12">
      <div className="relative">
        <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Bạn đang nghĩ gì!"
        className="w-full h-[60px] p-4 shadow-lg resize-none text-sm focus:outline-none bg-[var-white]"
        />
        {/* {!editingComment && ( */}
          <label className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer">
            <FaRegImage className="w-5 h-5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        {/* )} */}
      </div>

      {previewImages.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {previewImages.map((url, idx) => (
            <div key={idx} className="relative">
              <img
                src={url}
                alt="preview"
                className="w-30 h-30 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx, 'preview')}
                className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70 cursor-pointer"
              >
                <FiX className="text-white w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hiển thị ảnh mới */}
      {images.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {images.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={URL.createObjectURL(img)}
                alt="preview"
                className="w-30 h-30 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx, 'new')}
                className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-70 cursor-pointer"
              >
                <FiX className="text-white w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-end mt-4 gap-3">
        {editingComment && (
          <Button
            onClick={onCancelEdit}
            variant="outline-primary"
            disabled={loading}
          >
            Hủy
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : editingComment ? 'Cập nhật' : 'Bình luận'}
        </Button>
      </div>
    </div>
  );
};

export default CommentBox;
