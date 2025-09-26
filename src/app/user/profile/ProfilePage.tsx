'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { PostTable } from './PostTable';
import BackgroundBlur from "@/shared/BackgroundBlur";
import { authApi } from '@/lib/auth/authApi';
import FilterDropdown from '@/components/ui/FilterDropdown';

function CardItem({ icon, label, count, growth, color }: any) {
  const isPositive = growth >= 0;

  return (
    <div className="flex flex-col p-4 bg-white rounded-md shadow">
      <div
        className={`h-10 w-10 flex items-center justify-center rounded-full mb-2`}
        style={{ backgroundColor: `${color}20`, color: color }}
      >
        <i className={icon + " text-xl"} />
      </div>

      <span className="text-[#667085]">{label}</span>

      <div className="flex items-center gap-2 mt-1">
        <span className="text-2xl font-bold">{count}</span>
        <span
          className={`text-sm font-medium px-2 py-0.5 rounded-xl ${
            isPositive
              ? 'text-green-600 bg-[#E7F4EE]'
              : 'text-red-500 bg-red-100'
          }`}
        >
          {isPositive ? `+${growth}%` : `${growth}%`}
        </span>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([]);
  const [showAllBadges, setShowAllBadges] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const res = await authApi.getProfile(token);

        if (res.user) {
          setUser(res.user);
          setFilteredBlogs(res.user.blogs || []);
        } else {
          setUser(res);
          setFilteredBlogs(res.blogs || []);
        }
      } catch (err) {
        console.error("Lỗi load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Đang tải profile...</p>;
  if (!user) return notFound();

  const avatarUrl = user.avatar || '/Image.svg';

  const handleFilter = (value: string) => {
    if (value === 'mine') {
      setFilteredBlogs(user.blogs || []);
    } else if (value === 'shared') {
      setFilteredBlogs(user.sharedBlogs || []);
    }
  };

  const handleBanAccount = async () => {
    if (confirm("Bạn có chắc muốn khóa tài khoản của mình?")) {
      try {
        const res = await authApi.banUser();
        alert(res.message);
        localStorage.removeItem("accessToken");
        window.location.href = "/user/home";
      } catch (err) {
        console.error("Lỗi khi khóa tài khoản:", err);
        alert("Có lỗi xảy ra, vui lòng thử lại.");
      }
    }
  };

  return (
    <>
      <BackgroundBlur />
      <div className="flex flex-col">
        <div
          id="banner"
          className="relative m-4 md:m-8 w-[95%] mx-auto h-[200px] md:h-[300px] rounded-3xl bg-[#307AFD]"
        >
          <span className="absolute top-4 right-4 bg-[#FFFFFF4D] px-4 py-2 rounded-lg text-lg md:text-xl text-white">
            My Profile
          </span>
          <span className="absolute top-4 left-4 bg-[#FFFFFF4D] px-4 py-2 rounded-lg text-lg md:text-xl text-black">
            My Data
          </span>
        </div>

        <div
          id="bottom__section"
          className="grid grid-cols-1 md:grid-cols-[30%_70%] w-[92%] md:w-[84%] mx-auto gap-4 -mt-2 pb-10"
        >
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-sm shadow">
              <div className="flex flex-col relative m-1">
                <div className="h-24 md:h-32 w-full bg-[#307AFD] rounded-t-sm" />
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-12 md:-bottom-10">
                  <div className="rounded-full bg-white p-1 md:p-2 shadow-md">
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="rounded-full h-20 w-20 md:h-24 md:w-24 object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="flex mt-16 md:mt-14 justify-center gap-2 items-center text-center">
                <h2 className="font-semibold">{user.fullName}</h2>
              </div>

              <span className="block h-px bg-gray-400 my-6" />

              <div className="flex gap-4 items-center w-[95%] mx-auto mb-3">
                <i className="ri-mail-line h-8 w-8 flex items-center justify-center bg-[#E0E2E7] rounded-full"></i>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">Email</h4>
                  <span className="block text-sm text-gray-700 break-words">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 items-center w-[95%] mx-auto mb-4">
                <i className="ri-phone-line h-8 w-8 flex items-center justify-center bg-[#E0E2E7] rounded-full"></i>
                <div className="flex-1 text-sm">
                  <h4 className="font-medium">Phone</h4>
                  <span>{user.phone}</span>
                </div>
              </div>

              <div className="flex justify-center mb-6">
                <button
                  onClick={handleBanAccount}
                  disabled={user.banned}
                  className={`px-6 py-2 rounded-full font-medium text-white text-sm md:text-base ${
                    user.banned
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#307AFD] hover:bg-blue-700"
                  }`}
                >
                  {user.banned ? "Đã bị khóa" : "Khóa tài khoản"}
                </button>
              </div>
            </div>

            {user.badges && user.badges.length > 0 && (
              <div className="bg-white rounded-sm shadow p-4">
                <h3 className="font-semibold mb-3 text-center">
                  Huy hiệu đã đạt được
                </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {user.badges
                      .filter((badge: any) => badge.userProgress?.status === "earned")
                      .map((badge: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center px-3 py-1 rounded-md border bg-green-50 border-green-300 text-sm"
                        >
                          {badge.name}
                        </div>
                      ))}
                  </div>

                {user.badges.length > 6 && (
                  <div className="flex justify-center mt-3">
                    <button
                      onClick={() => setShowAllBadges(!showAllBadges)}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      {showAllBadges ? "Ẩn bớt" : "Xem thêm"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 p-4 mb-6">
              <CardItem
                icon="ri-navigation-line"
                label="Điểm đến"
                count={user.checkinCount}
                growth={user.checkinGrowth}
                color="#0D894F"
              />
              <CardItem
                icon="ri-file-text-fill"
                label="Bài viết"
                count={user.blogCount}
                growth={user.blogGrowth}
                color="#E46A11"
              />
              <CardItem
                icon="ri-verified-badge-line"
                label="Bài đánh giá"
                count={user.reviewCount}
                growth={user.reviewGrowth}
                color="#4338CA"
              />
            </div>

            <div className="m-4 shadow p-4 rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Bài đăng gần đây</h4>
                <FilterDropdown onSelect={handleFilter} />
              </div>
              <PostTable data={filteredBlogs} showActions={true} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
