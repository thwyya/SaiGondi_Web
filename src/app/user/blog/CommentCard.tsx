'use client';

import Image from 'next/image';
import { AiFillLike } from "react-icons/ai";
import { useEffect, useState } from 'react';
import { BlogComment } from '@/types/blogComment';
import { blogCommentApi } from '@/lib/blogComment/blogCommentApi';
import { FiX } from 'react-icons/fi';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import Button from '@/components/ui/Button';

type CommentCardProps = {
  comment: BlogComment;
  onUpdated?: () => void;
  onEdit?: (comment: BlogComment) => void;
};

const CommentCard = ({ comment, onUpdated, onEdit }: CommentCardProps) => {
  const [likes, setLikes] = useState(comment.totalLikes || 0);
  const [liked, setLiked] = useState(false);
  const [popupImage, setPopupImage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  useEffect(() => {
    if (currentUserId && comment.likeBy.includes(currentUserId)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
    setLikes(comment.totalLikes);
  }, [comment, currentUserId]);
  
  const handleLike = async () => {
    try {
      const updated = await blogCommentApi.likeComment(comment._id);
      setLikes(updated.totalLikes);
      if (currentUserId) {
        setLiked(updated.likeBy.includes(currentUserId));
      }
    } catch (err) {
      console.error("Failed to like comment", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    try {
      await blogCommentApi.deleteComment(comment._id);
      onUpdated?.();
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert("Vui lòng nhập lý do báo cáo!");
      return;
    }
    try {
      await blogCommentApi.reportComment(comment._id, reportReason);
      alert("Đã gửi báo cáo thành công!");
      setReportOpen(false);
      setReportReason("");
    } catch (err) {
      console.error("Failed to report comment", err);
    }
  };

  return (
    <>
    <div className="relative border-b border-[var(--gray-2)] py-4 flex flex-col gap-2">
      <button
        className="cursor-pointer absolute right-0 top-0 p-2 text-[var(--gray-2)] hover:text-[var(--gray-1)]"
        title="Tùy chọn"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <HiOutlineDotsVertical size={18} />
      </button> 
        {menuOpen && (
            <div className="absolute right-0 mt-4 bg-white rounded shadow-lg z-10 min-w-[120px]">
              {currentUserId === comment.userId?._id && (
                <>
                  <button
                    onClick={() => {
                      onEdit?.(comment);
                      setMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={handleDelete}
                    className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-500"
                  >
                    Xóa
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setReportOpen(true);
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100"
              >
                Báo cáo
              </button>
            </div>
          )}
      <button
        onClick={handleLike}
        className="cursor-pointer absolute right-8 top-0 p-2 flex items-center gap-1 text-[var(--gray-2)] hover:text-[var(--gray-1)]"
        title="Yêu thích"
      >
        <AiFillLike size={18} className={liked ? "text-[var(--primary)]" : ""}/>
        <span className="text-sm">{likes}</span>
      </button>

      {/* Nội dung đánh giá */}
      <div className="flex items-start gap-3 pr-8"> 
        <div className="relative size-10 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={comment.userId?.avatar || "/Logo.svg"}
            alt={comment.userId?.firstName || "Ẩn danh"}
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-semibold pr-12">
            {comment.userId?.firstName || "Ẩn danh"} {comment.userId?.lastName || ""}
          </p>
          <p className="text-sm text-[var(--gray-2)] whitespace-pre-line">{comment.comment}</p>
          {comment.images && comment.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {comment.images.map((url, idx) => (
                <div key={idx} className="relative w-30 h-30 rounded overflow-hidden cursor-pointer hover:opacity-80 transition" onClick={() => setPopupImage(url)}>
                  <Image
                    src={url}
                    alt={`comment image ${idx}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    
    {/* popup xem ảnh lớn */}
    {popupImage && (
        <div 
          className="fixed inset-0 w-screen h-screen bg-black/20 backdrop-blur-xs flex items-center justify-center z-50"
          // onClick={() => setPopupImage(null)}
        >
          <div 
            className="relative w-[90%] max-w-3xl h-[80%]"
            onClick={(e) => e.stopPropagation()} // tránh click vào ảnh cũng đóng
          >
            <Image
              src={popupImage}
              alt="Popup image"
              fill
              className="object-contain max-h-[80vh] rounded-lg"
            />
          </div>
          <button
              className="absolute top-7 right-10 bg-black/50 text-white rounded-full p-2 hover:bg-black transition"
              onClick={() => setPopupImage(null)}
            >
              <FiX size={20} />
            </button>
        </div>
      )}

      {/* popup báo cáo */}
      {reportOpen && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">
          <h2 className="text-lg font-semibold mb-3">Báo cáo bình luận</h2>
          <textarea
            className="w-full border rounded p-2 mb-4 text-sm"
            rows={4}
            placeholder="Nhập lý do báo cáo..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => setReportOpen(false)}
                className="flex items-center gap-2 border border-[var(--gray-3)] text-[var(--gray-1)] hover:bg-[var(--gray-5)]"
              >
                Hủy
              </Button>
              <Button
                onClick={handleReport}
                variant="primary"
              >
                Gửi
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommentCard;
