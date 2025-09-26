// src/lib/blog/blogApi.ts
import axios from "axios";
import axiosInstance from "../axiosInstance";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const blogApi = {
  // Lấy danh sách blog (có phân trang + lọc theo query)
  // getBlogs: async (token: string, query?: Record<string, any>) => { //có token
  //   const res = await axios.get(`${API_URL}/blogs`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //     params: query
  //   });
  //   return res.data;
  // },
  getBlogs: async (query?: Record<string, any>) => { //không token
    const res = await axios.get(`${API_URL}/blogs`, {
      params: query
    });
    return res.data;
  },

  // Lấy chi tiết blog theo id
  getBlogById: async (id: string) => {
    const res = await axios.get(`${API_URL}/blogs/${id}`);
    return res.data.data;
  },

  // Lấy chi tiết blog theo slug
  getBlogBySlug: async (slug: string) => {
    const res = await axios.get(`${API_URL}/blogs/slug/${slug}`);
    return res.data.data;
  },

  // Tạo blog mới
  createBlog: async (formData: FormData) => {
    const res = await axiosInstance.post("/blogs", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  // Cập nhật blog
  updateBlog: async (id: string, formData: FormData) => {
    const res = await axiosInstance.put(`/blogs/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },

  // Xóa blog
  deleteBlog: async (id: string) => {
    const res = await axiosInstance.delete(`/blogs/${id}`);
    return res.data;
  },

  // Like hoặc bỏ like blog
  likeBlog: async (id: string) => {
    const res = await axiosInstance.patch(`/blogs/${id}/like`);
    return res.data.data;
  },

  // Chia sẻ blog
  shareBlog: async (id: string) => {
    const res = await axiosInstance.post(`/blogs/${id}/share`);
    return res.data;
  },

  // Cập nhật quyền riêng tư blog
  updateBlogPrivacy: async (id: string, privacy: "public" | "private") => {
    const res = await axiosInstance.patch(`/blogs/${id}/privacy`, { privacy });
    return res.data;
  },

  // Cập nhật trạng thái blog (vd: draft/published)
  updateBlogStatus: async (id: string, status: string) => {
    const res = await axiosInstance.patch(`/blogs/${id}/status`, { status });
    return res.data;
  },

  // Lấy danh sách blog theo tác giả
  getBlogsByAuthor: async (authorId: string) => {
    const res = await axiosInstance.get(`/blogs/author/${authorId}`);
    return res.data;
  },

  // Lấy danh sách blog theo địa điểm
  getBlogsByPlaceId: async (placeId: string) => {
    const res = await axios.get(`${API_URL}/blogs/place/${placeId}`);
    return res.data;
  },

  // Lấy danh sách blog theo ward
  getBlogsByWard: async (wardId: string) => {
    const res = await axios.get(`${API_URL}/blogs/ward/${wardId}`);
    return res.data;
  },
  // Lấy danh sách blog xem nhiều nhất
  getPopularBlogs: async (query?: Record<string, any>) => {
    const res = await axios.get(`${API_URL}/blogs/popular`, {
      params: query
    });
    return res.data;
  },
};
