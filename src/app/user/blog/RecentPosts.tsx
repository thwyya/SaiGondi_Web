'use client';

import React, { useEffect, useState } from "react";
import RecentPostCard from "./RecentPostCard";
import { blogApi } from "@/lib/blog/blogApi";
import { mapBlogToPost } from "@/lib/blog/mapBlogToPost";
import { Post } from "@/types/post";

const RecentPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await blogApi.getBlogs({ limit: 5, sort: "-createdAt", status: "approved" });
        const approvedPosts = res.data
          .filter((b: any) => b.status === "approved")
          .map(mapBlogToPost);

        setPosts(approvedPosts);
      } catch (err) {
        console.error("Lỗi khi lấy recent posts:", err);
      }
    }

    fetchBlogs();
  }, []);

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4">BÀI VIẾT MỚI ĐĂNG</h2>
      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <RecentPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default RecentPosts;
