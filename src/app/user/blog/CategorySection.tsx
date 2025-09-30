'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Category } from '@/types/category';
import { categoryApi } from '@/lib/category/categoryApi';

interface CategorySectionProps {
  activeTab: string;
  onChangeTab: (key: string) => void;
  onLoadCategories?: (keys: string[]) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  activeTab,
  onChangeTab,
  onLoadCategories,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAllCategories();
        const blogCategories: Category[] = res.filter(
          (c: Category) => c.type === "blog"
        );
        const picked = blogCategories.slice(0, 4);
        setCategories(picked);

        // báo cho parent biết 4 category chính
        if (onLoadCategories) {
          onLoadCategories(picked.map((c) => c.name));
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  // tạo mảng tab đầy đủ
  const tabs = [
    {
      key: 'all',
      label: 'Tất cả địa điểm',
      description: 'Tổng hợp tất cả các bài viết du lịch tại Sài Gòn',
      icon: '/icon.svg',
    },
    ...categories.map((c) => ({
      key: c.name,
      label: c.name,
      description: c.description,
      icon: c.icon || '/icon1.svg',
    })),
    {
      key: 'other',
      label: 'Khác',
      description: 'Những nội dung khác về Sài Gòn',
      icon: '/icon3.svg',
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex justify-center gap-4 flex-wrap py-6">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              onClick={() => onChangeTab(tab.key)}
              className={classNames(
                'cursor-pointer w-[220px] h-[163px] border p-4 text-left transition-all flex-shrink-0',
                {
                  'bg-[var(--secondary)] text-[var(--foreground)] border-transparent':
                    isActive,
                  'bg-transparent border border-[var(--gray-5)] text-[var(--gray-2)]':
                    !isActive,
                }
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-md flex items-center justify-center bg-[#FBF6EA]">
                  <Image
                    src={tab.icon}
                    alt={tab.label}
                    width={24}
                    height={24}
                  />
                </div>
              </div>
              <h3 className="font-semibold text-lg text-[var(--foreground)]">
                {tab.label}
              </h3>
              <p className="text-sm mt-1 text-[var(--gray-2)]">
                {tab.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySection; 
