export interface Post {
  id: string;
  slug: string;
  title: string;
  image: string;
  categories: string[];
  tags: string[];
  author: string;
  authorAvatar: string;
  date: string;
  address: string;
  ward: string;
  content: { type: "text" | "image" | "video"; value?: string; url?: string }[];
  album: { type: "image" | "video"; url: string; caption?: string | null }[];
  privacy: "public" | "private" | "friends-only" | "pending";
  likeBy: string[];
  totalLikes: number;
  totalComments: number;
  shareCount: number;
  viewCount: number;
  status: "pending" | "approved" | "hidden" | "deleted";
}