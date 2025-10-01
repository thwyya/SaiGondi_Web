import Link from 'next/link';
import Image from 'next/image';
import { Blog as Post } from '@/types/blog';
import { User } from '@/types/user';

export default function PostCard({ post }: { post: Post }) {
  const imageUrl = post.mainImage || '/image.svg'; // Default image
  
  // Check if authorId is populated
  const author = typeof post.authorId === 'object' ? (post.authorId as User) : null;
  const authorName = author ? `${author.firstName} ${author.lastName}`.trim() : 'Unknown Author';
  const authorAvatar = author && author.avatar ? author.avatar : '/avatar.svg';

  return (
    <Link href={`/blog/${post.slug}`} className="border rounded-lg shadow hover:bg-gray-50 transition overflow-hidden block">
      <div className="relative w-full h-40">
        <Image
          src={imageUrl}
          alt={post.title}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-semibold truncate">{post.title}</h2>
        <p className="text-sm text-blue-600 mt-1">Xem chi tiết</p>

        <div className="flex items-center mt-4">
          <Image
            src={authorAvatar}
            alt={authorName}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="text-sm text-gray-600 ml-2">{authorName}</span>
        </div>
      </div>
    </Link>
  );
}
