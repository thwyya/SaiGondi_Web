"use client";
import useFetch from '../../hooks/useFetch';
import { User } from '@/types/user'
import { BASE_URL } from '../../utils/config';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { blogApi } from '@/lib/blog/blogApi';
import axiosInstance from '@/lib/axiosInstance';
import { toast } from 'sonner';

interface UserResponse {
    success: boolean;
    user: User;
}

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('blogs');
    const [brokenIcons, setBrokenIcons] = useState<Set<string>>(new Set());
    const params = useParams();
    const id = params?.id;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') ?? undefined : undefined;

    const url = id ? `${BASE_URL}/admin/users/${id}` : "";
    const { data, loading, error } = useFetch<UserResponse>(url, token)
    const user = data?.user;

    const [blogDetails, setBlogDetails] = useState<any[] | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchBlogs = async () => {
            if (!user?.blogs || user.blogs.length === 0) {
                if (mounted) setBlogDetails([]);
                return;
            }

            try {
                const ids = (user.blogs || []).map((item: any) => (typeof item === 'string' ? item : (item?._id || item?.id))).filter(Boolean) as string[];
                if (ids.length === 0) {
                    if (mounted) setBlogDetails([]);
                    return;
                }

                const promises = ids.map(async (bid) => {
                    try {
                        const res = await axiosInstance.get(`/blogs/${bid}`);
                        return res.data?.data ?? null;
                    } catch (e: any) {
                        console.error(`Failed fetching blog ${bid}:`, e?.response?.data ?? e.message ?? e);
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                const filtered = results.filter(Boolean) as any[];
                if (mounted) setBlogDetails(filtered);
            } catch (err) {
                console.error('Failed fetching blog details', err);
                if (mounted) setBlogDetails([]);
            }
        };
        fetchBlogs();
        return () => { mounted = false };
    }, [user?.blogs]);

    const handleBlockAccount = async () => {
        if (!id) return;
        try {
            await axiosInstance.put(`/admin/users/${id}`);
            toast("Tài khoản đã được khoá thành công.");
        } catch (err) {
            console.error("Failed to block account", err);
            toast("Khoá tài khoản thất bại. Vui lòng thử lại.");
        }
    };

    if (loading) return <div>Loading...</div>
    if (error) return <div className='flex justify-center text-2xl text-red-500 mt-50 '>Tài khoản đã bị khóa</div>
    console.log('details', blogDetails)
    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-[var(--main)] font-semibold hover:text-blue-700 cursor-pointer">Admin</span>
                            <i className="ri-arrow-right-s-line text-slate-400"></i>
                            <a href='/admin/users' className='text-[var(--main)] hover:text-blue-700 font-medium'>Quản lý tài khoản</a>
                            <i className="ri-arrow-right-s-line text-slate-400"></i>
                            <span className='text-[var(--main)]'>Tài khoản người dùng</span>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200">
                                    <i className="ri-lock-line"></i>
                                    <span>Khoá tài khoản</span>
                                </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className='bg-white'>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Khoá tài khoản</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Bạn có chắc chắn muốn khoá tài khoản này? Hành động này có thể huỷ quyền truy cập của người dùng.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleBlockAccount}>Xác nhận</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Card - Profile */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                            {/* Cover & Avatar */}
                            <div className="relative">
                                <div className="h-32 "></div>
                                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
                                    <div className="relative">
                                        {user?.avatar ? (
                                            <img
                                                src={user?.avatar}
                                                alt={user?.fullName}
                                                className="h-32 w-32 rounded-full border-4 border-white object-cover"
                                            />
                                        ) : (
                                            <div className="h-32 w-32 rounded-full border-4 border-white bg-slate-200 flex items-center justify-center text-slate-400 text-5xl">
                                                <i className="ri-user-line"></i>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="pt-20 pb-6 px-6">
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{user?.fullName}</h2>

                                    {/* Badges Section */}
                                    {user?.badges && user.badges.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm text-slate-500 mb-3">Huy hiệu</p>
                                            <div className="flex flex-wrap gap-2 justify-center">
                                                {user.badges.map((badge: any) => (
                                                    <div
                                                        key={badge._id}
                                                        className={`relative group ${badge.userProgress?.status === 'achieved'
                                                            ? 'opacity-100'
                                                            : badge.userProgress?.status === 'in_progress'
                                                                ? 'opacity-75'
                                                                : 'opacity-40'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                                            {/* Badge Icon */}
                                                            <div className={`h-12 w-12 flex items-center justify-center rounded-full ${badge.userProgress?.status === 'achieved'
                                                                ? 'bg-yellow-100 text-yellow-600'
                                                                : badge.userProgress?.status === 'in_progress'
                                                                    ? 'bg-blue-100 text-blue-600'
                                                                    : 'bg-slate-100 text-slate-400'
                                                                }`}>
                                                                {badge.icon && typeof badge.icon === 'string' && badge.icon.startsWith('http') ? (
                                                                    !brokenIcons.has(badge._id) ? (
                                                                        <img
                                                                            src={badge.icon}
                                                                            alt={badge.name}
                                                                            className="h-8 w-8 object-contain"
                                                                            onError={() => setBrokenIcons(prev => new Set(prev).add(badge._id))}
                                                                        />
                                                                    ) : (
                                                                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-medium">
                                                                            {badge.name ? badge.name.charAt(0).toUpperCase() : <i className="ri-award-line"></i>}
                                                                        </div>
                                                                    )
                                                                ) : (
                                                                    <i className={`${badge.icon || 'ri-award-line'} text-xl`}></i>
                                                                )}
                                                            </div>

                                                            {/* Badge Name */}
                                                            <span className="text-xs font-medium text-slate-700 text-center">
                                                                {badge.name}
                                                            </span>

                                                            {/* Progress indicator */}
                                                            {badge.userProgress?.status === 'in_progress' && (
                                                                <span className="text-xs text-slate-500">
                                                                    {badge.userProgress.currentPoints}/{badge.pointsRequired}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Tooltip */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                                            <div className="bg-slate-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                                                                <p className="font-semibold mb-1">{badge.name}</p>
                                                                <p className="text-slate-300 mb-1">{badge.description}</p>
                                                                <p className="text-slate-400">
                                                                    {badge.userProgress?.status === 'achieved'
                                                                        ? `Đạt được: ${new Date(badge.userProgress.achievedAt).toLocaleDateString('vi-VN')}`
                                                                        : badge.userProgress?.status === 'in_progress'
                                                                            ? `Tiến độ: ${badge.userProgress.currentPoints}/${badge.pointsRequired} điểm`
                                                                            : 'Chưa bắt đầu'
                                                                    }
                                                                </p>
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>


                                <div className="space-y-4">
                                    {/* Email */}
                                    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg flex-shrink-0">
                                            <i className="ri-mail-line text-lg"></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className='text-sm text-slate-500 mb-0.5'>Email</p>
                                            <p className="text-slate-800 font-medium truncate">{user?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Stats & Posts */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-xl">
                                        <i className="ri-navigation-line rotate-45 text-xl"></i>
                                    </div>
                                </div>
                                <p className='text-slate-500 text-sm mb-1'>Điểm tích lũy</p>
                                <p className="text-3xl font-bold text-slate-800">{user?.points}</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 flex items-center justify-center bg-orange-100 text-orange-600 rounded-xl">
                                        <i className="ri-file-text-line text-xl"></i>
                                    </div>
                                </div>
                                <p className='text-slate-500 text-sm mb-1'>Bài viết</p>
                                <p className="text-3xl font-bold text-slate-800">{user?.sharedBlogs.length}</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-12 w-12 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-xl">
                                        <i className="ri-star-line text-xl"></i>
                                    </div>
                                </div>
                                <p className='text-slate-500 text-sm mb-1'>Đánh giá</p>
                                <p className="text-3xl font-bold text-slate-800">{user?.reviewCount}</p>
                            </div>
                        </div>

                        {/* Blogs & Shared Blogs Section */}
                        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                            {/* Tabs */}
                            <div className="flex border-b border-slate-200">
                                <div className='flex-1 px-6 py-4 font-medium transition-colors relative'>
                                    <div className="flex items-center text-blue-600 justify-center gap-2">
                                        <i className="ri-article-line"></i>
                                        <span>Bài viết ({user?.blogCount})</span>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {activeTab === 'blogs' && (
                                    <div className="space-y-4">
                                        {user?.blogs && user?.blogCount > 0 ? (
                                            blogDetails === null ? (
                                                <div className="text-center py-12 text-slate-400">Đang tải bài viết...</div>
                                            ) : blogDetails.length > 0 ? (
                                                blogDetails.map((blog: any) => (
                                                    <div
                                                        key={blog._id}
                                                        className="flex gap-4 p-4 rounded-lg border border-slate-200  transition-all"
                                                    >
                                                        <img
                                                            src={blog.mainImage}
                                                            alt={blog.title}
                                                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-slate-800 mb-2 line-clamp-2">
                                                                {blog.title}
                                                            </h3>
                                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                                <span className="flex items-center gap-1">
                                                                    <i className="ri-calendar-line"></i>
                                                                    {blog.createdAt}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <i className="ri-eye-line"></i>
                                                                    {blog.viewCount || blog.views || 0} lượt xem
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="space-y-2">
                                                    {user.blogs.map((item: any) => {
                                                        const blogId = typeof item === 'string' ? item : (item?._id || item?.id || String(item));
                                                        const short = String(blogId).slice(-8);
                                                        return (
                                                            <></>
                                                        )
                                                    })}
                                                </div>
                                            )
                                        ) : (
                                            <div className="text-center py-12 text-slate-400">
                                                <i className="ri-article-line text-5xl mb-3"></i>
                                                <p>Chưa có bài viết nào</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}