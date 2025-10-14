'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
  
  const [isUpdating, setIsUpdating] = useState(false);
  
    const isFavoritedByRedux = !userLoading && user?.favorites?.some((fav: any) => (typeof fav === 'object' && fav._id ? fav._id : fav) === destination._id);
  const [localIsFavorited, setLocalIsFavorited] = useState(isFavoritedByRedux);

  useEffect(() => {
    setLocalIsFavorited(isFavoritedByRedux);
  }, [isFavoritedByRedux]);

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
      toast.info("Vui lòng đăng nhập để yêu thích địa điểm.", {
        action: {
          label: "Đăng nhập",
          onClick: () => router.push('/auth/login'),
        },
      });
      return;
    }

    if (!destination._id) return;
    
    setIsUpdating(true);
    const previousIsFavorited = localIsFavorited;
    setLocalIsFavorited(!previousIsFavorited);

    try {
      let response;
      if (previousIsFavorited) {
        response = await removeFromFavorites(destination._id);
        toast.success("Đã xóa khỏi danh sách yêu thích!");
      } else {
        response = await addToFavorites(destination._id);
        toast.success("Đã thêm vào danh sách yêu thích!");
      }
      if (response && response.data && response.data.favorites) {
        dispatch(updateUser({ favorites: response.data.favorites }));
      }
    } catch (error) {
      setLocalIsFavorited(previousIsFavorited);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
      console.error("Failed to update favorite status", error);
    } finally {
      setIsUpdating(false);
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

            <span className="text-[var(--primary)] flex items-center gap-1 text-sm ">
                <i className="ri-map-2-line"></i> 
                {destination.ward?.name || 'Chưa rõ'}
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

        <div className="flex justify-between items-center gap-3">
          <button 
            onClick={handleFavoriteClick} 
            className="border w-[50px] h-[50px] rounded-lg flex items-center justify-center hover:bg-gray-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            disabled={userLoading || isUpdating}
          >
              <i className={`${localIsFavorited ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-600'} text-xl`}></i>
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