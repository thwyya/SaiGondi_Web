import api, { authApi } from "./api";
import { User } from "@/types/user";

export async function getUsers(): Promise<User[]>{
    const res = await api.get('/admin/users')
    return res.data
}

export const sendPasswordResetOTP = async (email: string) => {
  const response = await authApi.post("/users/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const response = await authApi.post("/users/reset-password", { email, otp, newPassword });
  return response.data;
};