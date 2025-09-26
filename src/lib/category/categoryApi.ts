import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const categoryApi = {
  // Lấy tất cả categories
  getAllCategories: async () => {
    const res = await axios.get(`${API_URL}/users/categories`);
    return res.data.data;
  }
};
