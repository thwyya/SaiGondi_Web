"use client";
import { useState, use, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPostByIdForAdmin as getPostById, updateBlogStatus } from '@/services/blogService';
import CustomDropdown from "@/shared/CustomDropdown";
import { useRouter } from "next/navigation";

interface Props {
  params: Promise<{id: string;}>;
}

export default function BlogDetail({params}: Props) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const router = useRouter();
  
  const {data: post, isLoading: postLoading, error: postError} = useQuery({
    queryKey: ['post', id],
    queryFn: () => getPostById(id),
  });

  const [postStatus, setPostStatus] = useState("pending");
  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    if (post) {
      setPostStatus(post.status || "pending");
      setForm({
        title: post.title || "",
        content: post.content?.map(c => c.value).join("\n") || "",
      });
    }
  }, [post]);

  const statusUpdateMutation = useMutation({
    mutationFn: (newStatus: "approved" | "rejected" | "pending" | "deleted") => updateBlogStatus(id, newStatus),
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(['post', id], updatedPost);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      if (updatedPost) {
        setPostStatus(updatedPost.status);
      }
    },
    onError: (error) => {
      console.error("Error updating post status:", error);
    }
  });

  const handleStatusUpdate = (status: "approved" | "rejected" | "pending" | "deleted") => {
    statusUpdateMutation.mutate(status);
  };

  const statusOptions = [
    { value: "approved", label: "Đã duyệt" },
    { value: "pending", label: "Chờ duyệt" },
    { value: "rejected", label: "Từ chối" },
    { value: "deleted", label: "Đã xóa" },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: string }> = {
      approved: {
        label: "Đã duyệt",
        className: "px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg font-medium text-xs inline-flex items-center gap-1.5",
        icon: "ri-checkbox-circle-fill"
      },
      rejected: {
        label: "Đã từ chối",
        className: "px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-medium text-xs inline-flex items-center gap-1.5",
        icon: "ri-close-circle-fill"
      },
      pending: {
        label: "Chờ duyệt",
        className: "px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium text-xs inline-flex items-center gap-1.5",
        icon: "ri-time-fill"
      },
      deleted: {
        label: "Đã xóa",
        className: "px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg font-medium text-xs inline-flex items-center gap-1.5",
        icon: "ri-delete-bin-fill"
      }
    };

    return statusMap[status] || {
      label: "Không xác định",
      className: "px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-medium text-xs inline-flex items-center gap-1.5",
      icon: "ri-question-fill"
    };
  };

  if (postLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (postError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="ri-error-warning-line text-5xl text-red-500"></i>
          <p className="mt-4 text-gray-600">Có lỗi xảy ra, vui lòng thử lại!</p>
        </div>
      </div>
    );
  }

  const currentStatus = getStatusBadge(post?.status || "pending");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">CHI TIẾT BÀI VIẾT</h1>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.push('/admin/dashboard')}>Admin</span>
            <i className="ri-arrow-right-s-line mx-1"></i>
            <span className="text-blue-600 hover:text-blue-700 cursor-pointer" onClick={() => router.push('/admin/blog')}>Quản lý bài đăng</span>
            <i className="ri-arrow-right-s-line mx-1"></i>
            <span className="text-gray-900">Chi tiết bài đăng</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={() => router.push('/admin/blog')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200"
            >
              <i className="ri-arrow-go-back-line"></i>
              <span className="font-medium">Quay lại</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Post Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">THÔNG TIN BÀI ĐĂNG</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề
                </label>
                <input 
                  id="title"
                  type="text" 
                  value={form.title}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-3 text-base bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung
                </label>
                <textarea 
                  id="content"
                  rows={12}
                  value={form.content}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg p-3 text-base bg-gray-100 resize-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">PHƯƠNG TIỆN</h2>
            
            <div className="space-y-6">
              {/* Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  {post?.album?.filter((img) => img.type === "image").length ? (
                    <div className="grid grid-cols-4 gap-4">
                      {post.album
                        .filter((img) => img.type === "image")
                        .map((img, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={img.url} 
                              alt={`Image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg shadow-sm"
                            />
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <i className="ri-image-line text-4xl mb-2"></i>
                      <p>Không có hình ảnh</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Video */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  {post?.album?.find((media) => media.type === "video") ? (
                    <div className="relative">
                      <video 
                        src={post.album.find((media) => media.type === "video")?.url}
                        controls
                        className="w-full max-w-md mx-auto rounded-lg shadow-sm"
                      />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <i className="ri-video-line text-4xl mb-2"></i>
                      <p>Không có video</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Category Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">DANH MỤC</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <div className="w-full border border-gray-300 rounded-lg p-3 text-base bg-gray-100">
                  {Array.isArray(post?.categories) ? post.categories.map(c => c.name).join(', ') : 'Không có'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="w-full border border-gray-300 rounded-lg p-3 text-base bg-gray-100 flex flex-wrap gap-2">
                  {post?.tags?.length ? post.tags.map(tag => (
                    <span key={tag} className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-sm">{tag}</span>
                  )) : 'Không có'}
                </div>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">TÌNH TRẠNG</h2>
              <span className={currentStatus.className}>
                {currentStatus.label}
              </span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cập nhật tình trạng
              </label>
              <CustomDropdown 
                className="w-full"
                options={statusOptions.map(opt => opt.label)}
                value={statusOptions.find(opt => opt.value === postStatus)?.label || ""}
                onChange={(label: string) => {
                  const option = statusOptions.find(opt => opt.label === label);
                  if (option && option.value !== postStatus) {
                    handleStatusUpdate(option.value as "approved" | "rejected" | "pending" | "deleted");
                  }
                }}
                disabled={statusUpdateMutation.isPending}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}