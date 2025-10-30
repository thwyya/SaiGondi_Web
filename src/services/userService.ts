import api, { authApi } from "./api";
import { User } from "@/types/user";
import type { QueryFunctionContext } from '@tanstack/react-query';

export const getUsers = async ({ queryKey }: QueryFunctionContext) => {
  const [, params] = queryKey as any[];
  return getUsersByParams(params);
}
export const getUsersByParams = async (params: any) => {
  const res = await api.get('/admin/users', { params });
  return res.data.data.users ?? res.data;
}

export const sendPasswordResetOTP = async (email: string) => {
  const response = await authApi.post("/users/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (email: string, otp: string, newPassword: string) => {
  const response = await authApi.post("/users/reset-password", { email, otp, newPassword });
  return response.data;
};