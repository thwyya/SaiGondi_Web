import { Blog } from "./blog";
import { Place } from "./place";

export interface Category {
  _id: string;
  id: string;
  name: string;
  icon: string | null;
  description: string;
  createdAt: string; 
  updatedAt: string; 
  type: string; 
  blogs: Blog[];
  places: Place[];
  blogCount: number;
  placeCount: number;
}