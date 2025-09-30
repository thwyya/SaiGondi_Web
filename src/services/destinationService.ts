import { Destination } from "@/types/destination"
import api from "./api"
export interface TopPlace {
  viewCount: any;
  _id: string;
  name: string;
  views: number;
  image?: string;
}
export async function getDestinations(): Promise<Destination[]> {
  const res = await api.get('/admin/places')
  return res.data.data.places ?? res.data
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