import axios from "axios";
import { BASE_URL } from "@/app/admin/utils/config";
import axiosInstance from "@/lib/axiosInstance";

const api = axiosInstance;

export const authApi = axios.create({
  baseURL: BASE_URL,
});

export default api;