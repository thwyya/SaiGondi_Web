'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from 'react';
import useUser from "@/hooks/useUser";
import { addToFavorites, addViewCount, removeFromFavorites } from "@/lib/place/destinationApi";
import { Place } from "@/types/place";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "@/store/slices/authSlice";

interface Props {
  destination: Place;
}

const DestinationCard = ({ destination }: Props) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: userLoading } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  
  const isFavorited = !userLoading && user?.favorites?.some((fav: any) => fav === destination._id);

  const id = destination._id || (destination as any).placeId;

  const handleClick = () => {
    if (!id) {
      console.error("Destination không có id:", destination);
      return;
    }    
    if (destination._id) {
      addViewCount(destination._id);
    }
    router.push(`/user/destination/${id}`);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để yêu thích địa điểm.");
      router.push('/auth/login');
      return;
    }

    if (!destination._id) return;

    try {
      let updatedFavorites;
      if (isFavorited) {
        await removeFromFavorites(destination._id);
        updatedFavorites = user.favorites.filter((fav: any) => fav !== destination._id);
      } else {
        await addToFavorites(destination._id);
        updatedFavorites = [...user.favorites, destination._id];
      }
      dispatch(updateUser({ favorites: updatedFavorites }));
    } catch (error) {
      console.error("Failed to update favorite status", error);
    }
  };

  const imageUrl =
    destination.images?.[0] ||
    "/image.svg";

  const avgRating = destination.avgRating || 0;
  const reviewCount = destination.totalRatings || 0;
  const location = destination.address || "Chưa rõ";

  return (
    <div className="grid grid-cols-[30%_70%] h-58 rounded-xl shadow-md bg-white overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={handleClick}>
      <div className="h-full overflow-hidden">
        <Image
        alt={destination.name}
        src={imageUrl}
        width={400}
        height={300}
        unoptimized
        className="w-full h-full object-cover"
      />
      </div>

      <div className="flex flex-col p-4">
        <div className="flex justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">{destination.name}</h2>
             <div className="flex items-center gap-4 text-sm">
            <span className="text-[var(--primary)] flex items-center gap-1 text-sm">
              <i className="ri-map-pin-fill"></i> {location}
            </span>

            <span className="text-[var(--primary)] flex items-center gap-1 text-sm ">
              <i className="ri-map-2-line"></i> 
              {destination.ward.name || 'Chưa rõ'}
            </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-yellow-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <i
                    key={index}
                    className={
                      index + 1 <= Math.floor(avgRating)
                        ? "ri-star-fill"
                        : index + 0.5 <= avgRating
                        ? "ri-star-half-line"
                        : "ri-star-line"
                    }
                  />
                ))}
              </span>

              {destination.services && (
                <span className="text-[var(--primary)]">
                  <i className="ri-cup-fill"></i>{" "}
                  {destination.services.length} SERVICE
                </span>
              )}
            </div>

            <div className="flex gap-4 items-center mt-2">
              <div className="border px-3 py-1 rounded-md text-[var(--primary)] font-bold">
                {avgRating.toFixed(1)}
              </div>
              {destination.status && (
                <div className="text-[var(--primary)] font-semibold">
                  {destination.status}
                </div>
              )}
              <div className="hidden md:block text-gray-500 text-sm">
                {reviewCount} Đánh giá
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end text-sm">
            {destination.distance && <p className="mt-2">{destination.distance}</p>}
          </div>
        </div>

        <span className="block h-px bg-gray-300 my-4" />

        <div className="flex justify-between items-center">
          <button 
            onClick={handleFavoriteClick} 
            className="border rounded-lg p-2 hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            disabled={userLoading}
          >
              <i className={`${isFavorited ? 'ri-heart-fill text-red-500' : 'ri-heart-line'} text-gray-600 text-lg`}></i>
            </button>
          <button
            onClick={handleClick}
            disabled={!id}
            className="btn-primary w-[70%] sm:w-[80%] h-10 rounded-3xl text-white text-sm cursor-pointer disabled:bg-gray-400"
          >
            XEM CHI TIẾT
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;