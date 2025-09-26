import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const userApi = {
  getOutstandingBloggers: async () => {
    const res = await axios.get(`${API_BASE_URL}/users/outstanding-bloggers`);
    return res.data.data;
  }
};