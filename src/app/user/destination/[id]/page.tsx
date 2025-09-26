"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from 'next/link';
import { ReactNode, useEffect, useState } from "react";
import { getDestinationById, createReview, getReviewsByPlaceId } from "@/lib/place/destinationApi";
import { Place } from "@/types/place";
import { Review } from "@/types/review";
import ReviewCard from "../ReviewCard";
import { wardApi } from "@/lib/ward/wardApi";
import { Ward } from "@/types/ward";
import { blogApi } from "@/lib/blog/blogApi";
import { Post } from "@/types/post";
import PostCard from "@/components/PostCard";
import { Bus, Car, CircleHelp, Coffee, Ticket, Wifi } from "lucide-react";


import useUser from "@/hooks/useUser";
import Button from '@/components/ui/Button';
import { IoChatbubbles } from 'react-icons/io5';
import { HiLocationMarker } from 'react-icons/hi';
import { ServiceOption } from "../addPlaceForm";

const DestinationDetail = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, isAuthenticated, loading: userLoading } = useUser();

  const [destination, setDestination] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [ward, setWard] = useState<Ward | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Post[]>([]);
  const [servicesData, setServicesData] = useState<{id: string, name: string}[]>([]);
  type ServiceKey = "Miễn phí đỗ xe" | "Miễn phí ăn sáng" | "Miễn phí Internet" | "Miễn phí di chuyển" | "Miễn phí hủy đặt trước";

  const serviceIcons: Record<ServiceKey, ReactNode> = {
  "Miễn phí đỗ xe": <Car className="w-4 h-4 text-gray-600" />,
  "Miễn phí ăn sáng": <Coffee className="w-4 h-4 text-gray-600" />,
  "Miễn phí Internet": <Wifi className="w-4 h-4 text-gray-600" />,
  "Miễn phí di chuyển": <Bus className="w-4 h-4 text-gray-600"/>,
  "Miễn phí hủy đặt trước": <Ticket className="w-4 h-4 text-gray-600" />
};
  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const destinationRes = await getDestinationById(id);
          const place = destinationRes?.data || destinationRes?.place || destinationRes;
          setDestination(place);
          setReviews(place.reviews || []);

          // Fetch blogs by place ID
          const blogsByPlaceRes = await blogApi.getBlogsByPlaceId(id);
          const blogsByPlace = blogsByPlaceRes.data || [];
          console.log("Blogs by place:", blogsByPlace);

          // Fetch blogs by ward ID
          let blogsByWard = [];
          let blogWardIdSource: any = place.ward;

          if (typeof blogWardIdSource === 'string' && blogWardIdSource.startsWith('[') && blogWardIdSource.endsWith(']')) {
            try {
              const parsed = JSON.parse(blogWardIdSource);
              blogWardIdSource = Array.isArray(parsed) ? parsed[0] : blogWardIdSource;
            } catch (e) {
              console.error("Failed to parse blogWardId:", e);
            }
          }

          if (Array.isArray(blogWardIdSource)) {
            blogWardIdSource = blogWardIdSource[0];
          }

          const finalBlogWardId =
            typeof blogWardIdSource === 'object' && blogWardIdSource !== null
              ? (blogWardIdSource as any)._id
              : typeof blogWardIdSource === 'string'
                ? blogWardIdSource
                : null;

          if (finalBlogWardId) {
            const blogRes = await blogApi.getBlogsByWard(finalBlogWardId);
            blogsByWard = blogRes.data || [];
            console.log("Blogs by ward:", blogsByWard);
          }

          // Combine and remove duplicates
          const allBlogs = [...blogsByPlace, ...blogsByWard];
          const uniqueBlogs = allBlogs.reduce((acc, current) => {
            if (!acc.find((item: Post) => item._id === current._id)) {
              acc.push(current);
            }
            return acc;
          }, [] as Post[]);
          console.log("Unique blogs:", uniqueBlogs);

          setRelatedBlogs(uniqueBlogs);

        } catch (error) {
          console.error("Failed to fetch data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (destination?.ward) {
      const fetchWard = async () => {
        try {
          let wardIdSource: any = destination.ward;

          if (typeof wardIdSource === 'string' && wardIdSource.startsWith('[') && wardIdSource.endsWith(']')) {
            try {
              const parsed = JSON.parse(wardIdSource);
              wardIdSource = Array.isArray(parsed) ? parsed[0] : wardIdSource;
            } catch (e) {
              console.error("Failed to parse wardId:", e);
            }
          }

          if (Array.isArray(wardIdSource)) {
            wardIdSource = wardIdSource[0];
          }

          const finalWardId =
            typeof wardIdSource === 'object' && wardIdSource !== null
              ? (wardIdSource as any)._id
              : typeof wardIdSource === 'string'
                ? wardIdSource
                : null;

          if (finalWardId) {
            const wardRes = await wardApi.getById(finalWardId);
            console.log("Ward response:", wardRes);
            setWard(wardRes.ward || wardRes);
          }
        } catch (error) {
          console.error("Failed to fetch ward:", error);
        }
      };
      fetchWard();
    }
  }, [destination]);

  // Fetch services data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/services");
        if (!res.ok) throw new Error("Failed to fetch services");
        const data = await res.json();
        console.log("services api response:", data);
        
        const formatted = data.data.map((service: {id: string, name: string}) => ({
          id: service.id,
          name: service.name
        }));
        setServicesData(formatted);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!destination) {
    return <div className="text-center py-10">Destination not found.</div>;
  }

  console.log("Destination data:", destination); // For browser console debugging

  // Helper function to get service name by ID
  const getServiceName = (serviceId: string) => {
    const service = servicesData.find(s => s.id === serviceId);
    return service ? service.name : serviceId; // fallback to ID if not found
  };

  const mainImage =
    Array.isArray(destination.images) && destination.images.length > 0
      ? destination.images[0]
      : "/image.svg";

  return (
    <div className="bg-gradient-to-b from-orange-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 flex gap-2 mb-4">
          <span>Việt Nam</span>
          <span>/</span>
          <span>Thành phố Hồ Chí Minh</span>
          <span>/</span>
          <span className="text-gray-700 font-medium">{ward?.name || '...'}</span>
        </div>

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {destination.name}
            </h1>
            <div className="flex items-center gap-2 text-blue-600 mt-2">
              <i className="ri-map-pin-2-fill"></i>
              <span>{ward?.name || '...'}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold">
                {(destination.avgRating || 0).toFixed(1)}
              </span>
              <span className="text-sm text-gray-600">
                {destination.totalRatings || 0} Đánh giá
              </span>
              <span className="text-pink-600 text-sm">Cách bạn 350m</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="border rounded-lg p-2 hover:bg-gray-100">
              <i className="ri-heart-line text-gray-600 text-lg"></i>
            </button>
            <button className="border rounded-lg p-2 hover:bg-gray-100">
              <i className="ri-bookmark-line text-gray-600 text-lg"></i>
            </button>
            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold">
              Ăn uống
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          <div className="col-span-2 row-span-2">
            <Image
              src={mainImage}
              alt={destination.name}
              width={800}
              height={600}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {Array.isArray(destination.images) &&
            destination.images.slice(1, 5).map((img, idx) => (
              <Image
                key={idx}
                src={img || "/image.svg"}
                alt={`Ảnh ${idx + 2} của ${destination.name}`}
                width={400}
                height={300}
                className="w-full h-40 object-cover rounded-lg"
              />
            ))}

          {Array.isArray(destination.images) &&
            destination.images.length > 5 && (
              <div className="relative">
                <Image
                  src={destination.images[5]}
                  alt="Xem thêm"
                  width={400}
                  height={300}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold rounded-lg cursor-pointer">
                  Xem thêm
                </div>
              </div>
            )}
        </div>

        {/* Giới thiệu */}
        <section className="mt-8">
          <h2 className="text-lg font-bold mb-3">GIỚI THIỆU</h2>
          <p className="text-gray-700 leading-relaxed">
            {destination.description}
          </p>

          {/* Rating tags */}
          <div className="mt-6 flex items-center gap-4">
            <div className="bg-blue-600 text-white text-center px-4 py-3 rounded-lg">
              <p className="text-2xl font-bold">
                {(destination.avgRating || 0).toFixed(1)}
              </p>
              <p className="text-sm">{destination.totalRatings} nhận xét</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {destination.services.map((serviceId, index) => {
                const serviceName = getServiceName(serviceId);
                return (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg text-sm"
                  >
                    {/* icon fallback nếu không khớp key */}
                    {serviceIcons[serviceName as ServiceKey] ?? (
                      <CircleHelp className="w-4 h-4 text-gray-400" />
                    )}
                    {serviceName}
                  </span>
                );
              })}
            </div>
          </div >


        </section>

        {/* Vị trí */}

        <section className="mt-8">
          <h2 className="text-lg font-bold mb-3">Vị trí</h2>
          <p className="text-gray-600 mb-3">{destination.address}</p>
          <iframe
            src={`https://www.google.com/maps?q=${destination.location?.coordinates?.[1] ?? destination.lat},${destination.location?.coordinates?.[0] ?? destination.lng}&hl=vi&z=16&output=embed`}
            width="100%"
            height="400"
            className="rounded-lg border"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="mt-3">
            <a
              href={`https://www.google.com/maps?q=${destination.location?.coordinates?.[1] ?? destination.lat},${destination.location?.coordinates?.[0] ?? destination.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-medium"
            >
              Xem trên Google Map
            </a>
          </div>
        </section>


        {/* Đánh giá */}
        <section className="mt-8">
          <h2 className="text-lg font-bold mb-6">ĐÁNH GIÁ</h2>
          <div className="flex items-center gap-6 mb-6">
            <span className="text-4xl font-bold text-green-800">
              {(destination.avgRating || 0).toFixed(1)}
            </span>
            <span className="text-gray-600">
              {destination.totalRatings} Lượt đánh giá
            </span>
          </div>

          {/* Review list */}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((reviewItem) => (
                <ReviewCard key={reviewItem._id} review={reviewItem} />
              ))
            ) : (
              <p className="text-gray-600">Chưa có đánh giá nào.</p>
            )}
          </div>

          {/* Nút "Viết đánh giá" -> check login */}
          <button
            className="mt-6 bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold disabled:bg-gray-400"
            onClick={() => {
              if (userLoading) return; // Chờ check user xong
              if (!isAuthenticated) {
                alert("Vui lòng đăng nhập để viết đánh giá.");
                router.push('/auth/login');
              } else {
                setShowReviewForm(true);
              }
            }}
            disabled={userLoading}
          >
            {userLoading ? 'Đang tải...' : 'Viết đánh giá'}
          </button>

          {showReviewForm && (
            <div className="mt-8 overflow-auto max-h-[80vh]">
              <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative mx-auto">
                {/* Nút đóng */}
                <button
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowReviewForm(false)}
                >
                  <i className="ri-close-line text-xl"></i>
                </button>

                {/* Header */}
                <div className="flex flex-col items-center mb-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-100 mb-2">
                    <i className="ri-check-line text-green-600 text-xl"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">ĐÁNH GIÁ</h3>
                  <p className="text-gray-500 text-sm">Viết đánh giá địa điểm</p>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!isAuthenticated) {
                      alert("Vui lòng đăng nhập để gửi đánh giá.");
                      router.push('/auth/login');
                      return;
                    }
                    try {
                      const reviewData = {
                        rating: rating,
                        comment: comment,
                      };
                      await createReview(id, reviewData);

                      // Refetch reviews sau khi tạo mới
                      const reviewsRes = await getReviewsByPlaceId(id);
                      setReviews(reviewsRes.reviews || []);

                      setShowReviewForm(false);
                      setRating(0);
                      setComment("");
                      alert("Gửi đánh giá thành công!");
                    } catch (error) {
                      console.error("Failed to submit review:", error);
                      alert("Gửi đánh giá thất bại. Vui lòng thử lại.");
                    }
                  }}
                >
                  {/* Rating Stars */}
                  <div className="flex justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <i
                          className={`ri-star-fill text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}>
                        </i>
                      </button>
                    ))}
                  </div>

                  {/* Nội dung đánh giá */}
                  <div className="mb-4">
                    <label
                      htmlFor="comment"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nội dung đánh giá
                    </label>
                    <input
                      type="text"
                      id="comment"
                      placeholder="Quán ăn ngon..."
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      disabled={rating === 0 || comment.trim() === ''}
                    >
                      Confirm
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>

        {/* Bài viết liên quan */}
        <section className="relative pt-20 pb-60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-start justify-between flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold font-inter text-gray-800 leading-tight">
                CÁC BÀI VIẾT LIÊN QUAN
              </h1>
              <Button
                variant="outline-primary"
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 h-fit rounded-none"
              >
                Xem tất cả
              </Button>
            </div>

            <p
              className="
                text-gray-600 font-inter
                text-sm sm:text-base lg:text-[17px]
                leading-relaxed sm:leading-relaxed lg:leading-8
                mb-6 sm:mb-8
                max-w-[540px] sm:max-w-[620px] lg:max-w-[700px]
                pr-3 sm:pr-6 lg:pr-12
              "
            >
              Cùng xem các trải nghiệm của khách hàng
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
              gap-x-6 lg:gap-x-8 xl:gap-x-10
              gap-y-45 sm:gap-y-20 md:gap-y-40 lg:gap-y-20">

              {relatedBlogs.map((post) => {
                if (!post || !post._id) return null;

                const author = typeof post.authorId === 'object' ? post.authorId : null;
                const authorName = author ? `${author.firstName || ''} ${author.lastName || ''}`.trim() : 'Unknown Author';
                const authorAvatar = author ? author.avatar : '/avatar.svg';
                const postTitle = post.title || 'Untitled Post';
                const postWard = (typeof post.ward === 'object' && post.ward !== null) ? ward?.name : 'Unknown Location';

                return (
                  <div key={post._id} className="relative py-6">
                    <div className="absolute bottom-0 left-0 w-full h-70 z-0">
                      <Image
                        src={post.mainImage || "/default.jpg"}
                        alt={postTitle}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>

                    <div className="bg-white left-3 shadow-lg overflow-hidden relative z-10 translate-y-45 w-[88%] sm:w-[85%] ml-0 mt-8 mb-6">

                      <div className="absolute top-6 left-0 w-1 h-10 bg-[var(--warning)] z-20" />
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between text-xs sm:text-sm text-[var(--warning)] mb-3 sm:mb-4">
                          <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString("vi-VN") : ''}</span>
                        </div>

                        <div className="border-t border-gray-200 pt-2 mt-2">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 leading-snug">
                            {postTitle}
                          </h3>

                          <div className="flex items-center space-x-2">
                            <Image
                              src={authorAvatar}
                              alt={authorName}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <p className="text-gray-800 text-[12px] sm:text-sm font-inter">
                              {authorName}
                            </p>
                          </div>

                          <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-gray-500 mt-2 whitespace-nowrap">
                            <span className="flex items-center gap-1 min-w-0">
                              <HiLocationMarker className="text-[var(--warning)] shrink-0" />
                              <span className="truncate">{postWard}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <IoChatbubbles className="text-[var(--warning)]" />
                              Bình luận({post.commentsCount || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="hidden md:block absolute top-42 right-3 sm:right-6 lg:right-9 w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] lg:w-[220px] lg:h-[220px] pointer-events-none -z-10">
            <Image src="/Graphic_Elements.svg" alt="Background" fill className="object-contain" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default DestinationDetail;