import { useEffect, useState } from "react";
import { blogCommentApi } from "@/lib/blogComment/blogCommentApi";
import { BlogComment } from "@/types/blogComment";

export function useComments(blogId: string, token?: string) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blogId) return;
    setLoading(true);
    blogCommentApi.getCommentsByBlog(blogId)
      .then((data: { comments: BlogComment[] }) => setComments(data.comments))
      .finally(() => setLoading(false));
  }, [blogId]);

  const addComment = async (content: string) => {
    if (!token) return;
    const newComment = await blogCommentApi.createComment(blogId, content);
    setComments((prev) => [newComment, ...prev]);
  };

  const editComment = async (id: string, content: string) => {
    if (!token) return;
    const updated = await blogCommentApi.updateComment(id, content);
    setComments((prev) => prev.map((c) => (c._id === id ? updated : c)));
  };

  const removeComment = async (id: string) => {
    if (!token) return;
    await blogCommentApi.deleteComment(id);
    setComments((prev) => prev.filter((c) => c._id !== id));
  };

  const toggleLike = async (id: string) => {
    if (!token) return;
    const updated = await blogCommentApi.likeComment(id);
    setComments((prev) => prev.map((c) => (c._id === id ? updated : c)));
  };

  return { comments, loading, addComment, editComment, removeComment, toggleLike };
}