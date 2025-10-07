

export interface SharedBlog {
    blog: string;
    sharedAt: string;
    _id: string;
    id: string;
  }
  
  export interface User {
    _id: string;
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    emailVerified: boolean;
    avatar: string;
    bio: string;
    role: 'user' | 'admin';
    favorites: string[];
    points: number;
    badges: any[];
    banned: boolean;
    _destroyed: boolean;
    sharedBlogs: SharedBlog[];
    createdAt: string;
    updatedAt: string;
  }

