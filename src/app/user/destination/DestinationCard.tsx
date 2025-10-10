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
    <div className="flex flex-col sm:grid sm:grid-cols-[35%_65%] lg:grid-cols-[30%_70%] rounded-xl shadow-md bg-white overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200" onClick={handleClick}>
      <div className="h-48 sm:h-full overflow-hidden">
        <Image
          alt={destination.name}
          src={imageUrl}
          width={400}
          height={300}
          unoptimized
          className="w-full h-64 object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-3 sm:p-4 lg:p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-1 sm:gap-2 flex-1">
            {/* Title */}
            <h2 className="font-semibold text-base sm:text-lg lg:text-xl line-clamp-2">{destination.name}</h2>

            {/* Location Info */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
              <span className="text-[var(--primary)] flex items-center gap-1">
                <i className="ri-map-pin-fill"></i>
                <span className="truncate">{location}</span>
              </span>

              <span className="text-[var(--primary)] flex items-center gap-1">
                <i className="ri-map-2-line"></i>
                <span className="truncate">{destination.ward.name || 'Chưa rõ'}</span>
              </span>
            </div>

            {/* Ratings and Services */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm mt-1">
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
                <span className="text-[var(--primary)] flex items-center gap-1">
                  <i className="ri-cup-fill"></i>{" "}
                  {destination.services.length} SERVICES
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4 items-center mt-1 sm:mt-2">
              <div className="border px-2 sm:px-3 py-1 rounded-md text-[var(--primary)] font-bold text-sm">
                {avgRating.toFixed(1)}
              </div>
              {destination.status && (
                <div className="text-[var(--primary)] font-semibold text-xs sm:text-sm">
                  {destination.status}
                </div>
              )}
              <div className="text-gray-500 text-xs sm:text-sm">
                {reviewCount} Đánh giá
              </div>
            </div>
          </div>

          {/* Distance (Desktop only) */}
          <div className="hidden lg:flex lg:flex-col lg:items-end lg:text-sm">
            {destination.distance && <p className="mt-2">{destination.distance}</p>}
          </div>
        </div>

        <span className="block h-px bg-gray-300 my-3 sm:my-4" />

        {/* Action Buttons */}
        <div className="flex justify-between items-center gap-3">
          <button
            onClick={handleFavoriteClick}
            className="border rounded-lg p-2 sm:p-3 hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 shrink-0"
            disabled={userLoading}
          >
            <i className={`${isFavorited ? 'ri-heart-fill text-red-500' : 'ri-heart-line'} text-gray-600 text-lg sm:text-xl`}></i>
          </button>
          <button
            onClick={handleClick}
            disabled={!id}
            className="btn-primary flex-1 h-9 sm:h-10 lg:h-10 rounded-2xl sm:rounded-3xl text-white text-xs sm:text-sm font-medium cursor-pointer disabled:bg-gray-400 transition-colors"
          >
            XEM CHI TIẾT
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;