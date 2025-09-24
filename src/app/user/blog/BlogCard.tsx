'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { FaRegCommentDots } from 'react-icons/fa6';
import { Post } from '@/types/blog';
import { jwtDecode } from "jwt-decode";
import { blogCommentApi } from '@/lib/blogComment/blogCommentApi';

interface BlogCardProps {
  post: Post;
}

function getExcerpt(content: Post["content"], maxLength = 150) {
  const textBlock = content.find(c => c.type === "text");
  if (!textBlock?.value) return "";
  if (textBlock.value.length > maxLength) {
    return textBlock.value.slice(0, maxLength) + "...";
  }
  return textBlock.value;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const [totalComments, setTotalComments] = useState<number>(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setCurrentUserId(decoded.id); // BE phải trả về `id` trong payload
      } catch (err) {
        console.error("Decode token error:", err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await blogCommentApi.getCommentsByBlog(post.id, { page: 1, limit: 1 });
        setTotalComments(res.pagination.total); 
      } catch (error) {
        console.error("Lỗi khi lấy tổng số bình luận:", error);
      }
    };

    if (post?.id) {
      fetchComments();
    }
  }, [post?.id]);

  const profileLink =
    currentUserId && post.authorId === currentUserId
      ? "/user/profile"
      : `/user/profile/${post.authorId}`;

  return (
    <div className="flex flex-col md:flex-row gap-6 bg-[var(--background)] p-4">
      <Link
        href={`/user/blog/${post.slug}`}
        className="w-full md:w-[300px] h-[260px] relative overflow-hidden shrink-0"
      >
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover rounded-lg"
        />
      </Link>

      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="max-w-full md:max-w-[calc(100%-20px)]">
          <Link href={`/user/blog/${post.slug}`}>
            <h2 className="text-xl font-bold text-[var(--black-2)] line-clamp-3 break-words">
              {post.title}
            </h2>
          </Link>

          <span className="inline-block text-xs bg-[var(--secondary)] text-white font-semibold rounded px-2 py-0.5 my-2">
            {post.category}
          </span>

          <p className="text-sm text-[var(--black-3)] line-clamp-3 break-words">
            {getExcerpt(post.content)}
          </p>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-sm text-[var(--gray-2)] gap-2">
          <Link href={profileLink} className="flex items-center gap-2">
            <Image
              src={post.authorAvatar}
              alt={post.author}
              width={30}
              height={30}
              className="object-cover rounded-full"
            />
            <span>{post.author}</span>
          </Link>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1">
              <FaMapMarkerAlt className="text-[var(--secondary)]" />
              <span>{post.ward}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaRegCommentDots className="text-[var(--gray-2)]" />
              <span>Bình luận ({totalComments})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
