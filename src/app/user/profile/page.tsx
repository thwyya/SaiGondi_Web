'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { PostTable } from './PostTable';
import BackgroundBlur from "@/shared/BackgroundBlur";
import { posts } from '@/app/assets/data/post';
import { authApi } from '@/lib/auth/authApi';

interface Props {
  params: {
    id: string;
  };
}

export default function ProfilePage({ params }: Props) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const res = await authApi.getProfile(token);
        setUser(res.user); 
      } catch (err) {
        console.error('Lỗi load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Đang tải profile...</p>;
  if (!user) return notFound();

  return (
    <>
      <BackgroundBlur />
      <div className="flex flex-col">
        <div id="banner" className="relative m-8 w-[95%] mx-auto">
          <img
            src={user.cover || '/images/default-cover.jpg'}
            alt=""
            className="w-full h-[300px] object-cover rounded-3xl"
          />
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
          <div
            id="left__container"
            className="bg-white border border-[#E0E2E7] rounded-sm shadow-[0px_2px_2.67px_0px_#1018281A]"
          >
            <div
              id="img__container"
              className="flex flex-col relative m-1 rounded-sm"
            >
              <img
                src={user.cover || '/images/default-cover.jpg'}
                alt=""
                className="h-40 w-full object-cover"
              />
              <img
                src={user.avatar || '/images/default-avatar.png'}
                alt=""
                className="rounded-full h-20 w-20 absolute left-1/2 -translate-x-1/2 -bottom-10 bg-gray-400 border-4 border-white z-10"
              />
            </div>

            <div className="flex mt-12 justify-center gap-2 items-center">
              <h2>{user.fullName}</h2>
              <span className="block p-1 bg-[#EFEFFD] text-(--primary) px-1 rounded-3xl">
                {user.badges?.length || 0}
              </span>
            </div>

            <span className="block h-px overflow-hidden bg-gray-400 my-8 origin-top scale-y-20" />

            <div className="flex gap-4 items-center w-[95%] mx-auto">
              <i className="ri-mail-line h-8 w-8 flex items-center justify-center text-[#667085] bg-[#E0E2E7] rounded-full text-lg border border-4 border-[#F0F1F3]"></i>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="text-[#4D5464]">Email</h4>
                  <button className="bg-[#EFEFFD] text-[#00000033] rounded-3xl px-1">
                    Chỉnh sửa
                  </button>
                </div>
                <span>{user.email}</span>
              </div>
            </div>

            <div className="flex gap-4 items-center w-[95%] mx-auto mt-4">
              <i className="ri-phone-line h-8 w-8 flex items-center justify-center text-[#667085] bg-[#E0E2E7] rounded-full text-lg border border-4 border-[#F0F1F3]"></i>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="text-[#4D5464]">Phone</h4>
                  <button className="bg-[#EFEFFD] text-[#00000033] rounded-3xl px-1">
                    Chỉnh sửa
                  </button>
                </div>
                <span>{user.phone}</span>
              </div>
            </div>

            <div className="flex justify-center my-2">
              <button className="btn-primary text-white my-4 px-6 py-2 rounded-2xl">
                Khoá tài khoản
              </button>
            </div>
          </div>

          <div id="info__container">
            <div
              id="card__groud"
              className="grid grid-cols-3 w-full justify-between gap-3 lg:gap-6 p-4 mb-6"
            >
              <div className="flex flex-col p-4 bg-white border border-[#E0E2E7] rounded-md shadow-[0px_2px_2.67px_0px_#1018281A] ">
                <i className="ri-navigation-line rotate-90 h-8 w-8 flex items-center justify-center text-[#0D894F] bg-[#CFE7DC] rounded-full text-lg border border-4 border-[#E7F4EE]"></i>
                <span className="text-[#667085] h-[72px] sm:h-[24px]">
                  Điểm đến
                </span>
                <span>{user.points}</span>
              </div>
              <div className="flex flex-col p-4 bg-white border border-[#E0E2E7] rounded-md shadow-[0px_2px_2.67px_0px_#1018281A]">
                <i className="ri-file-text-fill h-8 w-8 flex items-center justify-center text-[#E46A11] bg-[#FAE1CF] rounded-full text-lg border border-4 border-[#FDF1E8]"></i>
                <span className="text-[#667085] h-[72px] sm:h-[24px]">
                  Bài viết
                </span>
                <span>{user.sharedBlogs?.length || 0}</span>
              </div>
              <div className="flex flex-col p-4 bg-white border border-[#E0E2E7] rounded-md shadow-[0px_2px_2.67px_0px_#1018281A]">
                <i className="ri-verified-badge-line h-8 w-8 flex items-center justify-center text-(--primary) bg-[#DEDEFA] rounded-full text-lg border border-4 border-[#EFEFFD]"></i>
                <span className="text-[#667085] h-[72px] sm:h-[24px]">
                  Bài đánh giá
                </span>
                <span>{user.favorites?.length || 0}</span>
              </div>
            </div>

            <div
              id="post__container"
              className="m-4 border border-[#E0E2E7] shadow-[0px_2px_2.67px_0px_#1018281A] p-4"
            >
              <div className="flex justify-between w-[95%] mx-auto">
                <h4>Bài đăng gần đây</h4>
                <div className="flex justify-center items-center px-2 border border-[#E0E2E7] rounded-xl">
                  <i className="ri-sound-module-line"></i>
                </div>
              </div>

              <PostTable data={posts.filter((p) => p.username === user.userId)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
