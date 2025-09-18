
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

export interface Author {
  _id: string;
  avatar: string;
  username: string;
  badge: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  mainImage: string;
  content: BlogContent[];
  album: AlbumItem[];
  categories: string[];
  tags: string[];
  privacy: "public" | "private" | "friends";
  totalLikes: number;
  likeBy: string[]; 
  shareCount: number;
  viewCount: number;
  authorId: Author;
  locationDetail: string;
  ward: string;
  province: string;
  originalPostId: string | null;
  status: "pending" | "approved" | "rejected"; 
  destroy: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// src/types/post.ts
export interface Post {
  id: string;
  slug: string;
  title: string;
  image: string;

  // Categories & Tags
  category: string;       // dùng cho hiển thị category đầu tiên
  categories: string[];   // toàn bộ categories
  tags: string[];

  // Author
  author: string;
  authorAvatar: string;

  // Thông tin thời gian & địa điểm
  date: string;
  address: string;
  ward: string;

  // Nội dung chính
  content: {
    type: "text" | "image" | "video";
    value?: string;
    url?: string;
  }[];

  // Album
  album: {
    type: "image" | "video";
    url: string;
    caption?: string | null;
  }[];

  // Cài đặt quyền riêng tư
  privacy: "public" | "private" | "friends-only" | "pending";

  // Tương tác
  likeBy: string[]; // danh sách userId đã like
  totalLikes: number;
  totalComments: number; 
  shareCount: number;
  viewCount: number;

  // Trạng thái
  status: "pending" | "approved" | "hidden" | "deleted";

}
