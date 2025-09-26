'use client';

import { useEffect, useState } from 'react';
import BloggerCard from './BloggerCard';
import { User } from '@/types/user';
import { userApi } from '@/lib/user/userApi';

type OutstandingBlogger = {
  author: Pick<User, "_id" | "firstName" | "lastName" | "avatar"| "bio">;
  totalBlogs: number;
  totalLikes: number;
  totalShares: number;
};

const FeaturedBloggers = () => {
  const [bloggers, setBloggers] = useState<OutstandingBlogger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBloggers = async () => {
      try {
        const data = await userApi.getOutstandingBloggers();
        setBloggers(data);
      } catch (err) {
        console.error("Failed to fetch outstanding bloggers", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBloggers();
  }, []);

  if (loading) {
    return <p>Đang tải danh sách blogger...</p>;
  }

  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold mb-4">CÁC BLOGGER NỔI BẬT</h3>
      <div className="flex flex-col gap-5">
        {bloggers.map((blogger) => (
          <BloggerCard
            key={blogger.author._id}
            avatar={blogger.author.avatar || "/Logo.svg"}
            name={`${blogger.author.firstName} ${blogger.author.lastName}`}
            description={blogger.author.bio}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedBloggers;
