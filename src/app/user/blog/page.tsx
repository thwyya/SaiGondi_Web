'use client';

import { useEffect, useState } from 'react';
import FeaturedPost from './FeaturedPost';
import SearchBox from '@/components/ui/SearchBox';
import CategorySection from './CategorySection';
import BlogListSection from './BlogListSection';
import RecentPosts from './RecentPosts';
import FeaturedBloggers from './FeaturedBloggers';
import Image from 'next/image';
import { blogApi } from '@/lib/blog/blogApi';
import { mapBlogToPost } from '@/lib/blog/mapBlogToPost';
import { useSearchParams } from 'next/navigation';

export default function BlogPage() {
  const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);
  const [activeCategoryKey, setActiveCategoryKey] = useState("all");
  const [mainCategoryKeys, setMainCategoryKeys] = useState<string[]>([]);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await blogApi.getBlogs({ limit: 3, sort: "-createdAt", status: "approved" });
        const approvedBlogs = res.data
          .filter((blog: any) => blog.status === "approved")
          .map(mapBlogToPost);
        
        setFeaturedPosts(approvedBlogs);
      } catch (err) {
        console.error("Lỗi khi lấy featured posts:", err);
      }
    }
    fetchBlogs();
  }, []);
  
  return (
    <main className="relative overflow-hidden">
      {/* blur */}
      <div className="absolute w-[500px] h-[500px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: '270px', left: '-240px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: '600px', left: '1200px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: '1100px', left: '-60px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: '2000px', left: '1300px' }} />
      <div className="absolute w-[500px] h-[500px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none" style={{ top: '2500px', left: '-60px' }} />
      
      <Image
        src="/city-bg.svg"
        alt="city-bg"
        width={355}
        height={216}
        className="absolute left-[-100px] top-[535px] z-0 pointer-events-none
             w-[200px] sm:w-[250px] md:w-[300px] lg:w-[355px] h-auto"
      />
      <Image
        src="/Graphic_Elements.svg"
        alt="Graphic_Elements"
        width={192}
        height={176}
        className="absolute left-[1420px] top-[875px] z-0 pointer-events-none
             w-[100px] sm:w-[140px] md:w-[160px] lg:w-[192px] h-auto"
      />
      <Image
        src="/Graphic_Elements.svg"
        alt="Graphic_Elements"
        width={192}
        height={176}
        className="absolute left-[1420] top-[2800px] z-0 pointer-events-none
        w-[100px] sm:w-[140px] md:w-[160px] lg:w-[192px] h-auto"
      />

      {/* nội dung trang page */}
      {featuredPosts.length > 0 && <FeaturedPost posts={featuredPosts} />}

      <div className="max-w-5xl mx-auto">
        <SearchBox />
      </div>

      <CategorySection
        activeTab={activeCategoryKey}
        onChangeTab={setActiveCategoryKey}
        onLoadCategories={setMainCategoryKeys}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-4 mt-6">
          <div className="flex-[0.7] min-w-0">
            <BlogListSection
              activeCategoryKey={activeCategoryKey}
              mainCategoryKeys={mainCategoryKeys}
            />
          </div>
          <div className="flex-[0.3] w-full lg:max-w-xs px-4 md:px-6 lg:pl-4 lg:pr-8 xl:px-0 pb-4 md:pb-6 lg:pb-8">
            <RecentPosts />
            <FeaturedBloggers />
          </div>
        </div>
      </div>
    </main>
  );
}