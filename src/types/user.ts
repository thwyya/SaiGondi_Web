

export interface SharedBlog {
    blog: string;
    sharedAt: string;
    _id: string;
    id: string;
  }
  
  export interface User {
    _id: string;
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    fullName: string;
    reviewCount: number;
    blogCount: number;
    email: string;
    emailVerified: boolean;
    avatar: string;
    bio: string;
    phone: string;
    role: 'user' | 'admin';
    blogs: string[];
    favorites: string[];
    points: number;
    badges: any[];
    banned: boolean;
    _destroyed: boolean;
    sharedBlogs: SharedBlog[];
    createdAt: string;
    updatedAt: string;
  }
  export interface Pagination {
    total: number;
    limit: number;
    page: number;
    totalPages: number;
  }

