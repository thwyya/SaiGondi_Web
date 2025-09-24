// src/lib/blog/mapBlogToPost.ts

import { Post } from "@/types/blog";

export function mapBlogToPost(blog: any): Post {
  return {
    id: blog._id,
    slug: blog.slug,
    title: blog.title,
    image: blog.mainImage || "/Logo.svg",

    // categories
    category: blog.categories?.[0] || "Chưa phân loại",
    categories: blog.categories || [], //lịch trình, kinh nghiệm, Sự kiện, Ảnh đẹp, Ẩm thực đặc sắc, Review chi tiết, top-list gợi ý
    tags: blog.tags || [],

    // author
    authorId: typeof blog.authorId === "object" ? blog.authorId._id : blog.authorId,
    author: typeof blog.authorId === "object"
      ? `${blog.authorId.firstName || ""} ${blog.authorId.lastName || ""}`.trim() || "Ẩn danh"
      : "Ẩn danh",
    authorAvatar: typeof blog.authorId === "object"
      ? blog.authorId.avatar || "/Logo.svg"
      : "/Logo.svg",

    // time & location
    date: blog.createdAt,
    address: blog.locationDetail || "", //address: blog.locationDetail || blog.ward?.name || blog.province || "",
    ward: blog.ward?.name || "",

    // content & album
    content: Array.isArray(blog.content) ? blog.content : [],
    album: Array.isArray(blog.album) ? blog.album : [],

    // privacy & interactions
    privacy: blog.privacy || "public",
    likeBy: blog.likeBy || [],
    totalLikes: blog.likeBy?.length || 0,
    totalComments: blog.totalComments || 0,
    shareCount: blog.shareCount || 0,
    viewCount: blog.viewCount || 0,

    // status
    status: blog.status || "pending",
  };
}
