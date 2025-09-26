// src/lib/blog/mapBlogToPost.ts

import { Blog } from "@/types/blog";
import { Post } from "@/types/post";

export function mapBlogToPost(blog: Blog): Post {
  const author = blog.authorId;

  const categoryNames: string[] =
    // blog.categories?.map(c => c?._id).filter(Boolean) as string[] || [];
    blog.categories?.map(c => c?.name).filter(Boolean) as string[] || ["Chưa phân loại"];


  return {
    id: blog._id,
    slug: blog.slug,
    title: blog.title,
    image: blog.mainImage || "/Logo.svg",

    // categories
    categories: categoryNames, //lịch trình, kinh nghiệm, Sự kiện, Ảnh đẹp, Ẩm thực đặc sắc, Review chi tiết, top-list gợi ý
    tags: blog.tags || [],

    // author
    author: author ? `${author.firstName || ""} ${author.lastName || ""}`.trim() || "Ẩn danh" : "Ẩn danh",
    authorAvatar: author?.avatar || "/Logo.svg",

    // time & location
    date: blog.createdAt,
    address: blog.locationDetail || "",
    ward: blog.ward?.name || "",

    // content & album
    content: blog.content || [],
    album: blog.album || [],

    // privacy & interactions
    privacy: blog.privacy === "friends" ? "friends-only" : blog.privacy || "public",
    likeBy: blog.likeBy || [],
    totalLikes: blog.likeBy?.length || 0,
    totalComments: 0,
    shareCount: blog.shareCount || 0,
    viewCount: blog.viewCount || 0,

    // status
    status: blog.status === "rejected" ? "hidden" : blog.status || "pending",
  };
}
