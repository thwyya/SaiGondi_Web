'use client';

import Image from 'next/image';
import { FaRegHeart, FaRegComment, FaHeart } from 'react-icons/fa';
import { LuCopy, LuShare2 } from 'react-icons/lu';
import { RiCalendar2Line } from 'react-icons/ri';
import { useEffect, useRef, useState } from 'react';
import { PiShareFat } from 'react-icons/pi';
import Link from 'next/link';
import { mapBlogToPost } from '@/lib/blog/mapBlogToPost';
import Button from '@/components/ui/Button';
import { blogApi } from '@/lib/blog/blogApi';
import { blogCommentApi } from '@/lib/blogComment/blogCommentApi';
import { Post } from '@/types/post';
import { getCurrentUserId } from '@/lib/auth/auth';
import { toast } from 'sonner';
import { useLoginNotice } from '@/hooks/useLoginNotice';
import { FiFlag } from 'react-icons/fi';

type BlogDetailProps = {
  post: any;
};

export default function BlogDetail({ post }: BlogDetailProps) {
  post = mapBlogToPost(post);
  const currentUserId = getCurrentUserId();

  const { show: showLogin, LoginNotice } = useLoginNotice();

  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (currentUserId && post.likeBy) {
      setLiked(post.likeBy.map(String).includes(currentUserId));
    } else {
      setLiked(false);
    }
  }, [currentUserId, post.likeBy]);

  const [likeCount, setLikeCount] = useState(post.totalLikes);
  const [shareCount, setShareCount] = useState(post.shareCount ?? 0);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const [visibleCount, setVisibleCount] = useState(3);
  const commentRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [totalComments, setTotalComments] = useState<number>(0); //lấy tổng số comment
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');

  // Gọi API lấy tổng số bình luận
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await blogCommentApi.getCommentsByBlog(post.id, {
          page: 1,
          limit: 1,
        });
        setTotalComments(res.pagination.total);
      } catch (err) {
        console.error('Lỗi khi lấy tổng số bình luận:', err);
      }
    };

    if (post?.id) fetchComments();
  }, [post?.id]);
  
  const toggleLike = async () => {
    if (!currentUserId) return showLogin();
    try {
      const updated = await blogApi.likeBlog(post.id);
      setLikeCount(updated.totalLikes);
      setLiked(updated.likeBy.map(String).includes(currentUserId));
    } catch {
      toast.error('Không thể thực hiện thao tác. Vui lòng thử lại.');
    }
  };

  const scrollToComments = () => {
    if (commentRef.current) {
      const y =
        commentRef.current.getBoundingClientRect().top +
        window.scrollY -
        100; 
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép liên kết!');
    setShowShareMenu(false);
  };

  const handleSharePersonal = async () => {
    if (!currentUserId) return showLogin();
    try {
      const res = await blogApi.shareBlog(post.id);
      setShareCount(res.shareCount);
      toast.success('Đã chia sẻ về trang cá nhân.');
    } catch (err: any) {
      if (err.response?.status === 429 || err.response?.data?.statusCode === 429) {
        toast.error('Bạn đã chia sẻ quá nhiều lần, vui lòng thử lại sau.');
      } else {
        toast.error('Có lỗi xảy ra khi chia sẻ. Vui lòng thử lại.');
      }
    } finally {
      setShowShareMenu(false);
    }
  };

  const handleReport = async () => {
    if (!currentUserId) return showLogin();
    if (!reportReason.trim()) {
      toast.error('Vui lòng nhập lý do báo cáo.');
      return;
    }
    try {
      await blogApi.reportBlog(post.id, reportReason.trim());
      toast.success('Đã gửi báo cáo bài viết.');
      setReportOpen(false);
      setReportReason('');
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Không thể gửi báo cáo. Vui lòng thử lại.';
      toast.error(message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  // Lock background scroll when report modal is open
  const scrollYRef = useRef<number>(0);
  useEffect(() => {
    if (reportOpen) {
      // store current scroll position
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;
      // lock scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
    } else {
      // restore
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      // restore scroll position
      window.scrollTo(0, scrollYRef.current || 0);
    }

    // cleanup on unmount
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollYRef.current || 0);
    };
  }, [reportOpen]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Tiêu đề */}
      <h1 className="text-justify text-3xl font-extrabold leading-snug text-[var(--foreground)] mb-2">
        {post.title}
      </h1>

      {/* Categories + Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.categories?.length > 0 ? (
          post.categories.map((cat: string, idx: number) => (
            <span
              key={idx}
              className="inline-block bg-[#F2F8F7] text-sm text-[var(--gray-1)] font-medium px-3 py-1 rounded-md"
            >
              {cat}
            </span>
          ))
        ) : (
          <span className="inline-block bg-[#F2F8F7] text-sm text-[var(--gray-1)] font-medium px-3 py-1 rounded-md">
            Chưa phân loại
          </span>
        )}
        
      </div>

      {/* Thông tin tác giả + like + share + report */}
      <div className="flex items-center justify-between flex-wrap text-sm text-[var(--gray-1)] mb-4">
        <div className="flex items-center gap-2">
          <Link href={`/user/profile/${post.authorId}`} className="flex items-center gap-2">
            <Image
              src={post.authorAvatar || '/Logo.svg'}
              alt={post.author || 'Ẩn danh'}
              width={20}
              height={20}
              className="object-cover rounded-full"
            />
            <span>{post.author || 'Ẩn danh'}</span>
          </Link>
          <span className="mx-1 text-[var(--gray-2)]">|</span>
          <span className="flex items-center gap-1">
            <RiCalendar2Line className="text-[var(--gray-2)]" />
            {post.date
              ? new Date(post.date).toLocaleDateString('vi-VN')
              : 'Không rõ ngày'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[var(--foreground)] text-base mt-2 sm:mt-0">
          <div className="cursor-pointer flex items-center gap-1" onClick={toggleLike}>
            {liked ? (
              <FaHeart className="text-[var(--error)]" />
            ) : (
              <FaRegHeart className="text-[var(--foreground)]" />
            )}
            <span>{likeCount}</span>
          </div>
          <div className="cursor-pointer flex items-center gap-1" onClick={scrollToComments}>
            <FaRegComment className="text-[var(--foreground)]" />
            <span>{totalComments}</span>
          </div>
          <div className="relative" ref={menuRef}>
            <div
              className="cursor-pointer flex items-center gap-1"
              onClick={() => setShowShareMenu((prev) => !prev)}
            >
              <LuShare2 className="text-[var(--foreground)]" />
              <span>{shareCount}</span>
            </div>
            {showShareMenu && (
              <div className="absolute right-0 mt-2 w-63 bg-[var(--background)] border border-[var(--gray-5)] rounded-lg shadow-lg z-10">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <LuCopy size={20} />
                  <span>Sao chép liên kết</span>
                </button>
                <button
                  onClick={handleSharePersonal}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  <PiShareFat size={20} />
                  <span>Chia sẻ về trang cá nhân</span>
                </button>
              </div>
            )}
          </div>
          <div
            className="cursor-pointer flex items-center gap-1"
            onClick={() => {
              if (!currentUserId) return showLogin();
              setReportOpen(true);
            }}
          >
            <FiFlag className="text-[var(--foreground)]" />
          </div>
        </div>
      </div>

      {/* Ảnh chính */}
      <div className="w-full h-[300px] relative mb-6">
        <Image
          src={post.image || '/Logo.svg'}
          alt={post.title || 'No title'}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* Nội dung */}
      <article className="prose prose-lg max-w-none text-justify text-[var(--foreground)] space-y-6">
        {post.content?.map((block: Post['content'][0], idx: number) => {
          if (block.type === 'text') {
            return <p key={idx}>{block.value}</p>;
          }
          if (block.type === 'image' && block.url) {
            return (
              <div key={idx} className="flex justify-center my-6">
                <Image
                  src={block.url || '/Logo.svg'}
                  alt={block.value || `image-${idx}`}
                  width={800}
                  height={600}
                  className="rounded-md max-w-full h-auto object-contain"
                />
              </div>
            );
          }
          if (block.type === 'video' && block.url) {
            return (
              <div key={idx} className="flex justify-center my-6">
                <video src={block.url} controls className="w-full max-h-[500px] rounded-md" />
              </div>
            );
          }
          return null;
        })}
      </article>

      <div className="flex flex-wrap gap-2 mb-4 mt-5">
        {post.tags?.map((tag: string, idx: number) => (
         <Link
            key={idx}
            href={`/search?q=${encodeURIComponent(tag)}&type=all`}
            className="inline-block bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 px-3 py-1 rounded-md transition"
          >
            #{tag}
          </Link>
      ))}
      </div>
      
      {/* Album */}
      {post.album && post.album.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Album</h2>

          <div className="flex flex-col gap-6">
            {post.album.slice(0, visibleCount).map((item: Post['album'][0], idx: number) => (
              <div key={idx} className="w-full relative aspect-video rounded-lg overflow-hidden">
                {item.type === 'image' ? (
                  <Image
                    src={item.url || '/Logo.svg'}
                    alt={item.caption || `album-${idx}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>

          {visibleCount < post.album.length && (
            <div className="mt-4 text-center">
              <Button
                variant="primary"
                className="px-6 py-2"
                onClick={() => setVisibleCount((prev: number) => prev + 3)}
              >
                Xem thêm
              </Button>
            </div>
          )}
        </div>
      )}
      <div ref={commentRef}></div>
      {reportOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md relative">
            <h2 className="text-lg font-semibold mb-3">Báo cáo bài viết</h2>
            <textarea
              className="w-full border rounded p-2 mb-4 text-sm"
              rows={4}
              placeholder="Nhập lý do báo cáo..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={() => setReportOpen(false)}
                className="flex items-center gap-2 border border-[var(--gray-3)] text-[var(--gray-1)] hover:bg-[var(--gray-5)]"
              >
                Hủy
              </Button>
              <Button onClick={handleReport} variant="primary">
                Gửi
              </Button>
            </div>
          </div>
        </div>
      )}
      <LoginNotice />
    </div>
  );
}