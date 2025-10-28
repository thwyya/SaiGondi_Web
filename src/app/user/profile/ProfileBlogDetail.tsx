// 'use client';

// import Image from 'next/image';
// import { RiCalendar2Line } from 'react-icons/ri';
// import { useState } from 'react';
// import Link from 'next/link';
// import { mapBlogToPost } from '@/lib/blog/mapBlogToPost';
// import Button from '@/components/ui/Button';
// import { Post } from '@/types/post';

// type ProfileBlogDetailProps = {
//   post: any;
// };

// export default function ProfileBlogDetail({ post }: ProfileBlogDetailProps) {
//   post = mapBlogToPost(post);
//   const [visibleCount, setVisibleCount] = useState(3);

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       <h1 className="text-justify text-3xl font-extrabold leading-snug text-[var(--foreground)] mb-2">
//         {post.title}
//       </h1>

//       <div className="flex flex-wrap gap-2 mb-4">
//         {post.categories?.length > 0 ? (
//           post.categories.map((cat: string, idx: number) => (
//             <span
//               key={idx}
//               className="inline-block bg-[#F2F8F7] text-sm text-[var(--gray-1)] font-medium px-3 py-1 rounded-md"
//             >
//               {cat}
//             </span>
//           ))
//         ) : (
//           <span className="inline-block bg-[#F2F8F7] text-sm text-[var(--gray-1)] font-medium px-3 py-1 rounded-md">
//             Chưa phân loại
//           </span>
//         )}
//       </div>

//       <div className="flex items-center gap-2 text-sm text-[var(--gray-1)] mb-4">
//         <Link href={`/user/profile/${post.authorId}`} className="flex items-center gap-2">
//           <Image
//             src={post.authorAvatar || '/Logo.svg'}
//             alt={post.author || 'Ẩn danh'}
//             width={20}
//             height={20}
//             className="object-cover rounded-full"
//           />
//           <span>{post.author || 'Ẩn danh'}</span>
//         </Link>
//         <span className="mx-1 text-[var(--gray-2)]">|</span>
//         <span className="flex items-center gap-1">
//           <RiCalendar2Line className="text-[var(--gray-2)]" />
//           {post.date
//             ? new Date(post.date).toLocaleDateString('vi-VN')
//             : 'Không rõ ngày'}
//         </span>
//       </div>

//       <div className="w-full h-[300px] relative mb-6">
//         <Image
//           src={post.image || '/Logo.svg'}
//           alt={post.title || 'No title'}
//           fill
//           className="object-cover rounded-lg"
//         />
//       </div>

//       <article className="prose prose-lg max-w-none text-justify text-[var(--foreground)] space-y-6">
//         {post.content?.map((block: Post['content'][0], idx: number) => {
//           if (block.type === 'text') {
//             return <p key={idx}>{block.value}</p>;
//           }
//           if (block.type === 'image' && block.url) {
//             return (
//               <div key={idx} className="flex justify-center my-6">
//                 <Image
//                   src={block.url || '/Logo.svg'}
//                   alt={block.value || `image-${idx}`}
//                   width={800}
//                   height={600}
//                   className="rounded-md max-w-full h-auto object-contain"
//                 />
//               </div>
//             );
//           }
//           if (block.type === 'video' && block.url) {
//             return (
//               <div key={idx} className="flex justify-center my-6">
//                 <video src={block.url} controls className="w-full max-h-[500px] rounded-md" />
//               </div>
//             );
//           }
//           return null;
//         })}
//       </article>

//       <div className="flex flex-wrap gap-2 mb-4 mt-5">
//         {post.tags?.map((tag: string, idx: number) => (
//           <span
//             key={idx}
//             className="inline-block bg-gray-100 text-sm text-gray-600 px-3 py-1 rounded-md"
//           >
//             #{tag}
//           </span>
//         ))}
//       </div>
      
//       {post.album && post.album.length > 0 && (
//         <div className="mt-8">
//           <h2 className="text-xl font-semibold mb-4">Album</h2>

//           <div className="flex flex-col gap-6">
//             {post.album.slice(0, visibleCount).map((item: Post['album'][0], idx: number) => (
//               <div key={idx} className="w-full relative aspect-video rounded-lg overflow-hidden">
//                 {item.type === 'image' ? (
//                   <Image
//                     src={item.url || '/Logo.svg'}
//                     alt={item.caption || `album-${idx}`}
//                     fill
//                     className="object-cover"
//                   />
//                 ) : (
//                   <video
//                     src={item.url}
//                     controls
//                     className="w-full h-full object-cover"
//                   />
//                 )}
//               </div>
//             ))}
//           </div>

//           {visibleCount < post.album.length && (
//             <div className="mt-4 text-center">
//               <Button
//                 variant="primary"
//                 className="px-6 py-2"
//                 onClick={() => setVisibleCount((prev: number) => prev + 3)}
//               >
//                 Xem thêm
//               </Button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


'use client';

import Image from 'next/image';
import { RiCalendar2Line } from 'react-icons/ri';
import { useState } from 'react';
import Link from 'next/link';
import { mapBlogToPost } from '@/lib/blog/mapBlogToPost';
import Button from '@/components/ui/Button';
import { Post } from '@/types/post';

type ProfileBlogDetailProps = {
  post: any;
};

export default function ProfileBlogDetail({ post }: ProfileBlogDetailProps) {
  post = mapBlogToPost(post);
  const [visibleCount, setVisibleCount] = useState(3);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-white rounded-2xl shadow-sm">
      {/* Title */}
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight text-center">
        {post.title}
      </h1>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {post.categories?.length > 0 ? (
          post.categories.map((cat: string, idx: number) => (
            <span
              key={idx}
              className="inline-block bg-gradient-to-r from-green-50 to-teal-50 text-teal-700 text-sm font-medium px-3 py-1 rounded-full border border-teal-100"
            >
              {cat}
            </span>
          ))
        ) : (
          <span className="inline-block bg-gray-50 text-gray-500 text-sm font-medium px-3 py-1 rounded-full border border-gray-100">
            Chưa phân loại
          </span>
        )}
      </div>

      {/* Author & Date */}
      <div className="flex flex-wrap justify-center items-center gap-3 text-sm text-gray-500 mb-6">
        <Link
          href={`/user/profile/${post.authorId}`}
          className="flex items-center gap-2 hover:text-teal-600 transition-colors"
        >
          <Image
            src={post.authorAvatar || '/Logo.svg'}
            alt={post.author || 'Ẩn danh'}
            width={28}
            height={28}
            className="object-cover rounded-full border border-gray-200"
          />
          <span className="font-medium">{post.author || 'Ẩn danh'}</span>
        </Link>
        <span className="mx-1">•</span>
        <span className="flex items-center gap-1">
          <RiCalendar2Line className="text-gray-400" />
          {post.date
            ? new Date(post.date).toLocaleDateString('vi-VN')
            : 'Không rõ ngày'}
        </span>
      </div>

      {/* Cover image */}
      <div className="relative w-full h-[400px] mb-10 rounded-2xl overflow-hidden shadow-md">
        <Image
          src={post.image || '/Logo.svg'}
          alt={post.title || 'No title'}
          fill
         //className="object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <article className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6 prose-img:rounded-lg prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline">
        {post.content?.map((block: Post['content'][0], idx: number) => {
          if (block.type === 'text') {
            return <p key={idx}>{block.value}</p>;
          }
          if (block.type === 'image' && block.url) {
            return (
              <div key={idx} className="flex justify-center my-8">
                <Image
                  src={block.url}
                  alt={block.value || `image-${idx}`}
                  width={800}
                  height={600}
                  className="rounded-xl shadow-sm"
                />
              </div>
            );
          }
          if (block.type === 'video' && block.url) {
            return (
              <div key={idx} className="flex justify-center my-8">
                <video
                  src={block.url}
                  controls
                  className="w-full max-h-[500px] rounded-xl shadow-sm"
                />
              </div>
            );
          }
          return null;
        })}
      </article>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10 mb-4 border-t pt-5 border-gray-100">
          {post.tags.map((tag: string, idx: number) => (
            <span
              key={idx}
              className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full hover:bg-gray-200 cursor-default transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Album */}
      {post.album && post.album.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-l-4 border-teal-500 pl-3">
            Album
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {post.album.slice(0, visibleCount).map((item: Post['album'][0], idx: number) => (
              <div key={idx} className="relative aspect-video rounded-xl overflow-hidden shadow-md">
                {item.type === 'image' ? (
                  <Image
                    src={item.url || '/Logo.svg'}
                    alt={item.caption || `album-${idx}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
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
            <div className="mt-6 text-center">
              <Button
                variant="primary"
                className="px-6 py-2 text-base"
                onClick={() => setVisibleCount((prev: number) => prev + 3)}
              >
                Xem thêm
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
