'use client';

import { useEffect, useState } from 'react';
import CommentCard from './CommentCard';
import { MdNavigateBefore, MdNavigateNext } from 'react-icons/md';
import { blogCommentApi } from '@/lib/blogComment/blogCommentApi';
import { BlogComment } from '@/types/blogComment';
import CommentBox from './CommentBox';
import { getCurrentUserId } from '@/lib/auth/auth';
import { useLoginNotice } from '@/hooks/useLoginNotice';

type CommentSectionProps = {
  blogId: string;
  onCommentAdded?: (comment: BlogComment) => void;
};

const CommentSection = ({ blogId, onCommentAdded }: CommentSectionProps) => {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingComment, setEditingComment] = useState<BlogComment | null>(null);
  const currentUserId = getCurrentUserId();

  const { show: showLogin, LoginNotice } = useLoginNotice();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { comments, pagination } = await blogCommentApi.getCommentsByBlog(blogId, {
          page: currentPage, 
        });

        setComments(comments);
        setTotalPages(pagination.totalPages);
      } catch (err) {
        console.error("Failed to fetch comments", err);
      }
    };
    fetchComments();
  }, [blogId, currentPage]);

  const handleNewComment = (newComment: BlogComment) => {
    setComments(prev => [newComment, ...prev]); // Thêm comment mới vào đầu danh sách
  };

  const handleUpdatedComment = (updated: BlogComment) => {
    setComments(prev =>
      prev.map(c => (c._id === updated._id ? updated : c))
    );
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
  };

  const refreshComments = async () => {
    try {
      const { comments, pagination } = await blogCommentApi.getCommentsByBlog(blogId, {
        page: currentPage, 
      });
      setComments(comments);
      setTotalPages(pagination.totalPages);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    }
  };

  return (
    <div className="space-y-2">
      {comments.length > 0 ? (
        comments.map((c) => (
          <CommentCard
            key={c._id}
            comment={c}
            onUpdated={refreshComments}
            onEdit={(comment) => setEditingComment(comment)}
            onRequireLogin={showLogin}
          />
        ))
      ) : (
        <p className="text-sm text-gray-500">Chưa có bình luận nào.</p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            className="cursor-pointer text-xl disabled:opacity-30"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <MdNavigateBefore size={24} />
          </button>
          <span className="text-sm text-[var(--gray-2)]">
            {currentPage} / {totalPages}
          </span>
          <button
            className="cursor-pointer text-xl disabled:opacity-30"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <MdNavigateNext size={24} />
          </button>
        </div>
      )}
      <CommentBox
        blogId={blogId}
        onCommentAdded={handleNewComment}
        onCommentUpdated={handleUpdatedComment}
        editingComment={editingComment}
        onCancelEdit={handleCancelEdit}
        onRequireLogin={showLogin}
      />
      
      <LoginNotice />
    </div>
  );
};

export default CommentSection;