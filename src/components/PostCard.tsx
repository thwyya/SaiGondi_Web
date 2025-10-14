import Link from 'next/link';
import Image from 'next/image';
import { Blog as Post } from '@/types/blog';
import { User } from '@/types/user';

const API_URL = 'http://localhost:5000';

export default function PostCard({ post }: { post: Post }) {
  const imageUrl = post.mainImage 
    ? (post.mainImage.startsWith('http') ? post.mainImage : `${API_URL}${post.mainImage}`)
    : '/image.svg';
 
  // Check if authorId is populated
  const author = typeof post.authorId === 'object' ? (post.authorId as User) : null;
  const authorName = author ? `${author.firstName} ${author.lastName}`.trim() : 'Unknown Author';
  const authorAvatar = author && author.avatar 
    ? (author.avatar.startsWith('http') ? author.avatar : `${API_URL}${author.avatar}`)
    : '/avatar.svg';

  return (
    <Link
      href={`/user/blog/${post.slug}`}
      className="flex flex-col h-full rounded-2xl bg-white/10 backdrop-blur-[12px] shadow-lg hover:shadow-xl transition border-2 border-white overflow-hidden cursor-pointer"
    >
      <div className="relative w-full aspect-[4/3] p-3">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          className="object-cover rounded-3xl p-3"
        />
      </div>
      <div className="flex flex-col justify-between flex-1 p-4 sm:p-5">
        <div className="space-y-1.5 sm:space-y-2.5">
          <h2 className="text-sm sm:text-lg font-bold text-[var(--black-1)] truncate">
            {post.title}
          </h2>
          <p className="text-[11px] sm:text-xs text-blue-600">Xem chi tiết</p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-4">
          <Image
            src={authorAvatar}
            alt={authorName}
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="text-xs sm:text-sm text-[var(--gray-3)]">{authorName}</span>
        </div>
      </div>
    </Link>
  );
}