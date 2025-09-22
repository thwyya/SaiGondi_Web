'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { PostTable } from './PostTable';
import BackgroundBlur from "@/shared/BackgroundBlur";
import { authApi } from '@/lib/auth/authApi';
import FilterDropdown from '@/shared/Filter';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const res = await authApi.getProfile(token);
        setUser(res.user);
        setFilteredBlogs(res.user.blogs || []); // mặc định hiển thị toàn bộ blogs
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

  const avatarUrl = user.avatar || 'https://placehold.co/100x100?text=Avatar';

  // Bộ lọc blog
  const handleFilter = (value: string) => {
    if (value === 'mine') {
      setFilteredBlogs(user.blogs || []);
    } else if (value === 'shared') {
      setFilteredBlogs(user.sharedBlogs || []);
    }
  };

  return (
    <>
      <BackgroundBlur />
      <div className="flex flex-col">
        {/* Banner */}
        <div
          id="banner"
          className="relative m-8 w-[95%] mx-auto h-[300px] rounded-3xl bg-[#307AFD]"
        >
          <span className="absolute top-4 right-4 bg-[#FFFFFF4D] px-4 py-2 rounded-lg text-xl text-white">
            My Profile
          </span>
          <span className="absolute top-4 left-4 bg-[#FFFFFF4D] px-4 py-2 rounded-lg text-xl text-black">
            My Data
          </span>
        </div>

        <div
          id="bottom__section"
          className="grid grid-cols-1 md:grid-cols-[30%_70%] w-[92%] mx-auto"
        >
          <div className="bg-white rounded-sm shadow">
            <div className="flex flex-col relative m-1">
              <div className="h-40 w-full bg-[#307AFD] rounded-t-sm" />
              <img
                src={avatarUrl}
                alt="avatar"
                className="rounded-full h-20 w-20 absolute left-1/2 -translate-x-1/2 -bottom-10 border-4 border-white z-10 object-cover"
              />
            </div>

            <div className="flex mt-12 justify-center gap-2 items-center">
              <h2>{user.fullName}</h2>
              <span className="block p-1 bg-[#EFEFFD] px-1 rounded-3xl">
                {user.badges?.length || 0}
              </span>
            </div>

            <span className="block h-px bg-gray-400 my-8" />

            <div className="flex gap-4 items-center w-[95%] mx-auto">
              <i className="ri-mail-line h-8 w-8 flex items-center justify-center bg-[#E0E2E7] rounded-full"></i>
              <div className="flex-1">
                <h4>Email</h4>
                <span>{user.email}</span>
              </div>
            </div>

            <div className="flex gap-4 items-center w-[95%] mx-auto mt-4">
              <i className="ri-phone-line h-8 w-8 flex items-center justify-center bg-[#E0E2E7] rounded-full"></i>
              <div className="flex-1">
                <h4>Phone</h4>
                <span>{user.phone}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-3 gap-6 p-4 mb-6">
              <div className="flex flex-col p-4 bg-white rounded-md shadow">
                <span className="text-[#667085]">Điểm đến</span>
                <span>{user.checkinCount}</span>
              </div>
              <div className="flex flex-col p-4 bg-white rounded-md shadow">
                <span className="text-[#667085]">Bài viết</span>
                <span>{user.blogCount}</span>
              </div>
              <div className="flex flex-col p-4 bg-white rounded-md shadow">
                <span className="text-[#667085]">Bài đánh giá</span>
                <span>{user.reviewCount}</span>
              </div>
            </div>

            <div className="m-4 shadow p-4">
              <div className="flex justify-between items-center mb-4">
                <h4>Bài đăng gần đây</h4>
                <FilterDropdown onSelect={handleFilter} />
              </div>
              <PostTable data={filteredBlogs} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
