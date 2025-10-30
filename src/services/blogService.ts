import api from "./api";
import {Blog } from "@/types/blog";

export async function getPosts(): Promise<Blog[]>{
    const res = await api.get('/blogs?limit=1000')
    return res.data.data
}

export async function getPostById(id: string): Promise<Blog>{
    const res = await api.get(`/blogs/${id}`)
    return res.data.data
}

export async function getPostByIdForAdmin(id: string): Promise<Blog>{
    const res = await api.get(`/admin/posts/${id}`)
    return res.data.data
}

export async function getPostsByCategoryId(id: string): Promise<Blog[]> {
    const res = await api.get(`/blogs?categoryId=${id}`);
    return res.data.data;
}

export async function updateBlogStatus(id: string, status: "approved" | "rejected" | "pending" | "deleted"): Promise<Blog> {
    const res = await api.put(`/admin/posts/${id}/status`, { status });
    return res.data.data;
}