import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const profileApi = {
  // Lấy thông tin người dùng
  getProfile: async () => {
    return await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  },

  // Cập nhật thông tin người dùng
  updateProfile: async (data: { firstName: string; lastName: string; bio: string; avatar?: File | null}) => {
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("bio", data.bio);
    if (data.avatar) {
      formData.append("avatar", data.avatar);
    }

    return await axios.put(`${API_URL}/me`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
  },
};
