import { Destination } from "@/types/destination"
import api from "./api"
import type { QueryFunctionContext } from '@tanstack/react-query';
export interface TopPlace {
  viewCount: any;
  _id: string;
  name: string;
  views: number;
  image?: string;
}
export const getDestinationsByParams = async (params: any) => {
  const res = await api.get('/admin/places', { params });
  return res.data.data.places ?? res.data;
}

export const getDestinations = async ({ queryKey }: QueryFunctionContext) => {
  const [, params] = queryKey as any[];
  return getDestinationsByParams(params);
}
export const deleteDestination = async (id: string) => {
  try {
    const res = await api.delete(`/admin/places/${id}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi xóa địa điểm:", err);
    throw err;
  }
}
export async function getTopViewedPlaces(): Promise<TopPlace[]> {
  try {
    const res = await api.get("/admin/stats/topViewedPlaces"); 
    return res.data?.data ?? [];
  } catch (err) {
    console.error("Lỗi lấy top viewed places:", err);
    return [];
  }
}