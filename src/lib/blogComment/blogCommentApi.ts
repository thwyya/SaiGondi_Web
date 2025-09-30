import axios from "axios";
import axiosInstance from "../axiosInstance";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const blogCommentApi = {
  
  // Lấy tất cả comment (không cần blogId)
  getAllComments: async (params?: { page?: number; limit?: number }) => {
    const res = await axios.get(`${API_URL}/comments`, { params });
    return {
      comments: res.data.data,
      pagination: res.data.pagination,
      count: res.data.count,
    };
  },

  // Lấy tất cả comment theo blogId
  getCommentsByBlog: async (
    blogId: string,
    params?: { page?: number; limit?: number }
  ) => {
    const res = await axios.get(`${API_URL}/comments/${blogId}`, { params });
    return {
      comments: res.data.data,
      pagination: res.data.pagination,
      count: res.data.count,
    };
  },

  // Tạo comment mới
  createComment: async (blogId: string, comment: string, images?: File[]) => {
    const formData = new FormData();
    formData.append("comment", comment);
    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append("images", file); // key "images" phải trùng với BE multer
      });
    }
    const res = await axiosInstance.post(`/comments/${blogId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  // Cập nhật comment
  updateComment: async (id: string, comment: string, images?: File[]) => {
    const formData = new FormData();
    formData.append("comment", comment);
    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append("images", file);
      });
    }
    const res = await axiosInstance.patch(`/comments/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  // Xóa comment
  deleteComment: async (id: string) => {
    const res = await axiosInstance.delete(`/comments/${id}`);
    return res.data;
  },

  // Like / Unlike comment
  likeComment: async (id: string) => {
    const res = await axiosInstance.patch(`/comments/like/${id}`);
    return res.data.data;
  },

  // Report comment
  reportComment: async (id: string, reason: string) => {
    const res = await axiosInstance.post(`/comments/report/${id}`, { reason });
    return res.data.data;
  }
};