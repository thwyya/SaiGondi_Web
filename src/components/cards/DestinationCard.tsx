'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { HiLocationMarker } from 'react-icons/hi';
import { AiFillStar } from 'react-icons/ai';
import Button from '@/components/ui/Button';
import { useRouter } from "next/navigation";
import useUser from "@/hooks/useUser";
import { addToFavorites, removeFromFavorites } from "@/lib/place/destinationApi";


type DestinationCardProps = {
  _id: string; // Added
  title: string;
  location: string;
  distance: string;
  image: string;
  rating?: number;
  totalRatings?: number;
};

const DestinationCard: React.FC<DestinationCardProps> = ({
  _id, // Destructure _id
  title,
  location,
  distance,
  image,
  rating,
  totalRatings,
}) => {
  const router = useRouter();
  const { user, isAuthenticated, refetch } = useUser();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (user && _id) {
      const favoriteIds = (user.favorites || []).map((fav: any) =>
        typeof fav === "object" && fav !== null ? fav._id : fav
      );
      setIsFavorited(favoriteIds.includes(_id));
    } else {
      setIsFavorited(false);
    }
  }, [user, _id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || !user) {
      alert("Vui lòng đăng nhập để yêu thích địa điểm.");
      router.push('/auth/login');
      return;
    }

    const previousIsFavorited = isFavorited;
    setIsFavorited(!previousIsFavorited); // Optimistic UI update

    try {
      if (previousIsFavorited) {
        await removeFromFavorites(_id);
      } else {
        await addToFavorites(_id);
      }
      
      // After API call, refetch user data to get the truth from the server
      if (refetch) {
        await refetch();
      }
    } catch (error) {
      setIsFavorited(previousIsFavorited); // Revert UI on error
      console.error("Failed to update favorite status", error);
      alert("Đã xảy ra lỗi khi cập nhật yêu thích. Vui lòng thử lại.");
    }
  };

  return (
    <div key={user?._id} className="flex flex-col h-full rounded-2xl bg-white/10 backdrop-blur-[12px] shadow-lg hover:shadow-xl transition border-2 border-white overflow-hidden">
      <div className="relative w-full aspect-[4/3] top-2">
        <Image src={image} alt={title} fill className="object-cover rounded-3xl" />
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md"
        >
          <i className={`${isFavorited ? 'ri-heart-fill text-red-500' : 'ri-heart-line'} text-lg`}></i>
        </button>
      </div>
      <div className="flex flex-col justify-between flex-1 p-4 sm:p-5">
        <div className="space-y-1.5 sm:space-y-2.5">
          <p className="text-[11px] sm:text-xs text-[var(--gray-3)] flex items-center gap-1">
            <HiLocationMarker className="w-4 h-4 text-blue-500" />
            {location}
          </p>
          <h3 className="text-sm sm:text-lg font-bold text-[var(--black-1)]">
            {title}
          </h3>
          <p className="text-[11px] sm:text-xs text-[var(--gray-3)]">{distance}</p>
          {(rating !== undefined || totalRatings !== undefined) && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              {rating !== undefined && (
                <span className="flex items-center gap-1">
                  <AiFillStar className="text-yellow-400" />
                  {rating.toFixed(1)}
                </span>
              )}
              {totalRatings !== undefined && (
                <span>({totalRatings} lượt)</span>
              )}
            </div>
          )}
        </div>
        <div className="mt-3 sm:mt-4">
          <Button
            variant="outline-primary"
            onClick={handleFavoriteClick}  
            className="bg-[var(--white)] text-[var(--primary)] text-xs sm:text-sm font-medium px-4 py-1.5 w-full justify-center rounded-none border-none"
          >
            XEM CHI TIẾT
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;