
export interface Ward {
  _id: string;
  name: string;
  location: {
    type: string;
    coordinates: number[];
  };
}
export interface Category {
  _id: string;
  name: string; 
  description?: string;
}
export interface Place {
  _id: string;
  name: string;
  description: string;
  services: string[];
  address: string;
  ward: { _id: string; name: string };
  location: {
    type: string;
    coordinates: number[]; // [lng, lat]
  };
  images?: string[];
  
  gallery?: string[]; 
  avgRating: number;
  totalRatings: number;
  totalLikes: number;
  likeBy: string[];
  status: string;
  createdBy: { $oid: string };
  verifiedBy: { $oid: string };
  createdAt: { $date: string };
  updatedAt: { $date: string };
  slug: string;
  __v: number;
  category?: string;
  open_hours?: Record<string, string>;
  comments?: any[];
  lat: number;
  lng: number;


  distance?: string | number; 
  serviceCount?: number;
  reviewCount?: number;
}

export interface PlacesApiResponse {
  page: number;
  total_pages: number;
  places: Place[];
  // The following are from the existing code, might not be in the new API response
  pagination?: {
    totalPages: number;
    total: number;
  }
}
