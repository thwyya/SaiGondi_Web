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
  console.log("Fetching destinations with params:", params);
  try {
    const res = await axios.get(`${API_URL}/places`, { 
      params,
      timeout: 10000, // 10 second timeout
    });
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.warn("Rate limit exceeded. Retrying after delay...");
      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const res = await axios.get(`${API_URL}/places`, { params });
        return res.data;
      } catch (retryError) {
        console.error("Retry failed:", retryError);
        throw retryError;
      }
    }
    throw error;
  }
};

// Lấy chi tiết địa điểm theo ID
export const getDestinationById = async (id: string) => {
  const res = await axios.get(`${API_URL}/places/${id}`);
  return res.data;
};

// Tìm kiếm địa điểm
export const searchDestinations = async (params: any) => {
  const res = await axios.get(`${API_URL}/places/search`, { params });
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


// Thêm viewCount
export const addViewCount = async (id: string) => {
  const res = await axiosInstance.post(`/places/${id}/view`);
  return res.data;
};

// Xóa khỏi danh sách yêu thích
export const removeFromFavorites = async (id: string) => {
  const res = await axiosInstance.delete(`/places/${id}/favorite`);
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

// Lấy tất cả địa điểm (không phân trang)
export const getAllDestinations = async () => {
  const res = await axios.get(`${API_URL}/places`);
  if (Array.isArray(res.data.data)) {
    return res.data.data;
  }
  if (Array.isArray(res.data.data?.places)) {
    return res.data.data.places;
  }
  return [];
};

// Lấy địa điểm lân cận
export const getNearbyPlaces = async (latitude: number, longitude: number, radius = 5000) => {
  const res = await axiosInstance.get(`${API_URL}/places/nearby`, {
    params: { latitude, longitude, radius },
  });
  return res.data.data;
};