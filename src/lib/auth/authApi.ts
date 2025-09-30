import axios from "axios";
import axiosInstance from "../axiosInstance";
import { reset } from "react-svg-pan-zoom";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type VerifyOtpPayload =
  | { otp: string; email: string }
  | { otp: string; phone: string };

export const authApi = {
  // Đăng nhập
  login: async (email: string, password: string) => {
    const res = await axios.post(`${API_URL}/users/login`, { email, password });
    return res.data;
  },

  // Đăng ký
  register: async (
    lastName: string,
    firstName: string,
    email: string,
    phone: string,
    password: string
  ) => {
    const res = await axios.post(`${API_URL}/users/register`, {
      lastName,
      firstName,
      email,
      phone,
      password
    });
    return res.data;
  },

  // Đăng xuất
  logout: async () => {
    const res = await axiosInstance.post("/users/logout");
    return res.data;
  },

  // Refresh token (đã dùng trong axiosInstance)
  requestToken: async (refreshToken: string) => {
    const res = await axios.post(`${API_URL}/users/request-token`, { refreshToken });
    return res.data;
  },

  // Quên mật khẩu
  forgotPassword: async (email: string) => {
    const res = await axios.post(`${API_URL}/users/forgot-password`, { email});
    return res.data;
  },

  // Đặt lại mật khẩu
  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const res = await axiosInstance.put(`/users/reset-password`, { email, otp, newPassword });
    return res.data;
  },

  // Đổi mật khẩu
  changePassword: async (oldPassword: string, newPassword: string) => {
    const res = await axiosInstance.put("/users/change-password", {
      oldPassword,
      newPassword
    });
    return res.data;
  },

  // Gửi OTP qua email
  sendEmailOTP: async (email: string, purpose: "register" | "verify" | "forgot_password") => {
    const res = await axios.post(`${API_URL}/users/send-otp`, { email, purpose });
    return res.data;
  },

  // Xác thực OTP
  verifyOTP: async (emailOrPhone: string, otp: string) => {
    const isEmail = emailOrPhone.includes("@");
    const payload: VerifyOtpPayload = isEmail
      ? { otp, email: emailOrPhone }
      : { otp, phone: emailOrPhone };

    const res = await axios.post(`${API_URL}/users/verify-otp`, payload);
    return res.data;
  },

  // Lấy thông tin profile theo token
  getProfile: async (token: string) => {
    const res = await axios.get(`${API_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    return res.data;
  },
  
  getUserReviews: async (userId: string) => {
    const res = await axiosInstance.get(`/users/${userId}/reviews`)
    return res.data.data
  },
  deleteBlog: async (blogId: string) => {
    const res = await axiosInstance.delete(`/blogs/${blogId}`);
    return res.data;
  },
  banUser: async () => {
    const res = await axiosInstance.put("/users/me/ban");
    return res.data;
  },
  getUserById: async (id: string) => {
  const res = await axios.get(`${API_URL}/users/${id}`);
  return res.data;
},
};
