import { de } from "zod/v4/locales";
import axiosInstance from "../axiosInstance";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Tạo địa điểm mới (dùng axiosInstance để tự động gắn accessToken)
export const createDestination = async (destinationData: FormData) =>{
  const res = await axiosInstance.post(`${API_URL}/admin/places`, destinationData);
  return res.data;
}


// Lấy danh sách địa điểm
export const getDestinations = async (params?: any) => {
  console.log(" Fetching destinations with params:", params);
  const res = await axios.get(`${API_URL}/places`, { params });
  return res.data;
};

// Lấy chi tiết địa điểm theo ID
export const getDestinationById = async (id: string) => {
  const res = await axios.get(`${API_URL}/places/${id}`);
  return res.data;
};

// Tìm kiếm địa điểm
export const searchDestinations = async (query: string) => {
  const res = await axios.get(`${API_URL}/places/search`, { params: { q: query } });
  return res.data;
};

// Like địa điểm
export const likeDestination = async (id: string) => {
  const res = await axiosInstance.patch(`/places/${id}`);
  return res.data;
};

// Thêm vào danh sách yêu thích
export const addToFavorites = async (id: string) => {
  const res = await axiosInstance.post(`/places/${id}/favorite`);
  return res.data;
};

// Lấy review theo placeId
export const getReviewsByPlaceId = async (placeId: string, page: number = 1, limit: number = 5) => {
  const res = await axiosInstance.get(`/reviews`, {
    params: {
      placeId: placeId,
      page: page,
      limit: limit
    }
  });
  return res.data;
};

// Tạo review mới
export const createReview = async (destinationId: string, reviewData: any) => {
  const res = await axiosInstance.post(`/reviews/${destinationId}`, reviewData);
  return res.data;
};

// Xóa review
export const deleteReview = async (reviewId: string, userId: string) => {
  const res = await axiosInstance.delete(`/reviews/${reviewId}`, { data: { userId } });
  return res.data;
};

// Cập nhật review
export const updateReview = async (reviewId: string, reviewData: any) => {
  const res = await axiosInstance.put(`/reviews/${reviewId}`, reviewData);
  return res.data;
};

// Like review
export const likeReview = async (reviewId: string, userId: string) => {
  const res = await axiosInstance.post(`/reviews/${reviewId}/like`, { userId });
  return res.data;
};
