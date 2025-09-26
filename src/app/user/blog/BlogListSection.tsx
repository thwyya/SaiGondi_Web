'use client';

import React, { useEffect, useState } from "react";
import BlogCard from "./BlogCard";
import { blogApi } from "@/lib/blog/blogApi";
import { mapBlogToPost } from "@/lib/blog/mapBlogToPost";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { Post } from "@/types/post";
import { useSearchParams } from "next/navigation";

type BlogListSectionProps = {
  activeCategoryKey: string;
  mainCategoryKeys: string[];
};

const PAGE_SIZE = 10;

const BlogListSection = ({ activeCategoryKey, mainCategoryKeys }: BlogListSectionProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const searchParams = useSearchParams();
  const type = searchParams.get("type"); // lấy ?type=popular

  // Reset page khi đổi category
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryKey, type]);

  useEffect(() => {
    async function fetchBlogs(page: number) {
      try {
        let res;

        if (type === "popular") {
          // gọi API xem nhiều nhất
          res = await blogApi.getPopularBlogs({ page, limit: PAGE_SIZE });
        } else {
          // gọi API mặc định (bài mới)
          res = await blogApi.getBlogs({ page, limit: PAGE_SIZE, status: "approved" });
        }

        let blogs: Post[] = res.data
          .filter((b: any) => b.status === "approved")
          .map(mapBlogToPost);

        if (activeCategoryKey === "all") {
          // giữ nguyên
        } else if (activeCategoryKey === "other") {
          // chỉ cần có 1 category không thuộc 4 tab chính thì hiện
          blogs = blogs.filter(
            (b) => b.categories.some((cat) => !mainCategoryKeys.includes(cat))
          );
        } else {
          // hiện nếu có category trùng với tab đang chọn
          blogs = blogs.filter((b) => b.categories.includes(activeCategoryKey));
        }


        setPosts(blogs);

        const totalApproved = blogs.length;
        setTotalPages(Math.max(1, Math.ceil(totalApproved / PAGE_SIZE)));
      } catch (err) {
        console.error("Lỗi khi lấy blogs:", err);
      }
    }

    fetchBlogs(currentPage);

  }, [currentPage, activeCategoryKey, mainCategoryKeys]);


  return (
    <section className="px-4 pb-10 max-w-7xl mx-auto">
      <div className="space-y-2 shadow-lg">
        {posts.length > 0 ? (
          posts.map((post) => <BlogCard key={post.id} post={post} />)
        ) : (
          <p className="text-center py-10 text-gray-500">Không có bài viết</p>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 mt-10">
        <button
          className="cursor-pointer text-xl disabled:opacity-30"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <MdNavigateBefore size={24} />
        </button>
        <span className="text-sm text-[var(--gray-2)]">
          {currentPage} / {totalPages}
        </span>
        <button
          className="cursor-pointer text-xl disabled:opacity-30"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <MdNavigateNext size={24} />
        </button>
      </div>
    </section>
  );
};

export default BlogListSection;
