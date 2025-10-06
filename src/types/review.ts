import { User } from './user'; // Import User interface

export interface Review {
  _id: string;
  userId: User; // Use the User interface
  rating: number;
  comment: string;
  avatar?: string;
  createdAt: string;
  destinationId?: string; // placeId from backend
  status?: string;
}