import { Category } from "./category";
import { User } from "./user";
import { Ward } from "./ward";

export interface BlogContent {
  _id: string;
  type: "text" | "image" | "video"; 
  value?: string; 
  url?: string;  
  caption?: string | null;
}

export interface AlbumItem {
  _id: string;
  type: "image" | "video";
  url: string;
  caption: string | null;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  mainImage: string;
  content: BlogContent[];
  album: AlbumItem[];
  categories: Category[];
  tags: string[];
  privacy: "public" | "private" | "friends";
  totalLikes: number;
  likeBy: string[]; 
  shareCount: number;
  viewCount: number;
  authorId: User;
  locationDetail: string;
  ward: Ward;
  province: string;
  originalPostId: string | null;
  status: "pending" | "approved" | "rejected"; 
  destroy: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}