'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { IoChatbubbles } from 'react-icons/io5';
import { HiLocationMarker } from 'react-icons/hi';
import { blogApi } from '@/lib/blog/blogApi';
import { mapBlogToPost } from '@/lib/blog/mapBlogToPost';
import { Post } from '@/types/blog';
import { blogCommentApi } from '@/lib/blogComment/blogCommentApi';
import { useRouter } from 'next/navigation';

const PopularPostsSection = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter(); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await blogApi.getPopularBlogs({ limit: 4 });
        console.log("Popular Blogs raw:", res);

        const blogs = res?.data || [];
        const mapped = blogs.map(mapBlogToPost);

        const withComments = await Promise.all(
          mapped.map(async (post: { id: string }) => {
            try {
              const { count } = await blogCommentApi.getCommentsByBlog(post.id);
              return { ...post, totalComments: count };
            } catch (err) {
              console.error(`Lỗi khi load comments cho blog ${post.id}:`, err);
              return { ...post, totalComments: 0 };
            }
          })
        );

        setPosts(withComments);
      } catch (err) {
        console.error("Lỗi khi load popular blogs:", err);
      }
    };
    fetchData();
  }, []);

  const handleExplore = () => {
    router.push('/user/blog?type=popular');
  };

  return (
    <section className="relative pt-20 pb-60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-start justify-between flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-inter text-gray-800 leading-tight">
            CÁC BÀI VIẾT ĐƯỢC XEM NHIỀU NHẤT
          </h1>
          <Button
            onClick={handleExplore}
            variant="outline-primary"
            className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 h-fit rounded-none"
          >
            Xem tất cả
          </Button>
        </div>
        <p className="text-gray-600 font-inter text-sm sm:text-base lg:text-[17px] leading-relaxed mb-6 sm:mb-8 max-w-[700px]">
          Cùng xem các bài viết được xem nhiều nhất hôm nay
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-8 xl:gap-x-10 gap-y-45 sm:gap-y-20 md:gap-y-40 lg:gap-y-20">
          {posts.map((item, index) => (
            <div
              key={index}
              className="relative py-6 cursor-pointer"
              onClick={() => router.push(`/user/blog/${item.slug || item.id}`)}
            >
              <div className="absolute bottom-0 left-0 w-full h-70 z-0">
                <Image
                  src={item.image || '/city-2.svg'}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="bg-white left-0 shadow-lg overflow-hidden relative z-10 translate-y-45 w-[88%] sm:w-[90%] ml-0 mt-8 mb-6">
                <div className="absolute top-6 left-0 w-1 h-10 bg-[var(--warning)] z-20" />
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between text-xs sm:text-sm text-[var(--warning)] mb-3 sm:mb-4">
                    <span>{new Date(item.date).toLocaleDateString('vi-VN')}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 leading-snug">
                      {item.title}
                    </h3>

                    <div className="flex items-center space-x-2">
                      <Image
                        src={item.authorAvatar || '/avatar.svg'}
                        alt={item.author}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <p className="text-gray-800 text-[12px] sm:text-sm font-inter">
                        {item.author}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-gray-500 mt-2 whitespace-nowrap">
                      <span className="flex items-center gap-1 min-w-0">
                        <HiLocationMarker className="text-[var(--warning)] shrink-0" />
                        <span className="truncate">{item.ward || item.address || 'Không rõ'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <IoChatbubbles className="text-[var(--warning)]" />
                        Bình luận ({item.totalComments || 0})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:block absolute top-42 right-3 sm:right-6 lg:right-9 w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] lg:w-[220px] lg:h-[220px] pointer-events-none -z-10">
        <Image src="/Graphic_Elements.svg" alt="Background" fill className="object-contain" />
      </div>
    </section>
  );
};

export default PopularPostsSection;
