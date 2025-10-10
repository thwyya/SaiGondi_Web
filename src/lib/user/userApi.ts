import axiosInstance from "../axiosInstance";

export const userApi = {
  getMe: async () => {
    const res = await axiosInstance.get("/me/");
    return res.data.data;
  },
  getOutstandingBloggers: async () => {
    const res = await axiosInstance.get("/users/outstanding-bloggers");
    return res.data.data;
  }
};