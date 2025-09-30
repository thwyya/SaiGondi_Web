
export interface TopPlace {
  _id: string;
  name: string;
  address: string;
  avgRating: number;
  images?: string[];
}

export interface TopUser {
  _id: string;      
  userId: string;
  fullName: string;
  avatar: string;
  badges: { name: string }[];
}

