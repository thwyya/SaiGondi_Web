'use client';

import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import React, { useState } from 'react';

export interface QnaCardProps {
  title: string;
  description: string;
  author: string;
  imageUrl: string;
  sourceIcon?: React.ReactNode;
  sourceText?: string;
}

export default function QnaCard({
  title,
  description,
  author,
  imageUrl,
  sourceIcon = <FcGoogle />,
  sourceText = 'Google',
}: QnaCardProps) {
  const [expanded] = useState(false);

  return (
    <div className="relative h-full">
      <div
        className="
          absolute inset-0 -z-10 rounded-[20px] bg-[#307AFD63]
          transform-gpu translate-x-4 translate-y-4
        "
      />

      <div className="flex flex-col h-full bg-white rounded-[20px] p-4 sm:p-5 shadow-lg transition-all duration-300">
        <h3 className="text-base sm:text-[17px] md:text-[18px] font-bold text-gray-900 mb-3 sm:mb-4 leading-snug line-clamp-2">
          {title}
        </h3>

        <div
          className={`text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5 leading-snug flex-1 ${
            expanded ? '' : 'line-clamp-3'
          }`}
        >
        </div>

        <div className="mt-auto"> 
          <div className="flex flex-col gap-1 mb-3 sm:mb-4">
            <span className="text-sm sm:text-base font-semibold font-inter">
              {author}
            </span>
            <div className="flex items-center gap-2">
              {sourceIcon}
              <span className="text-xs sm:text-sm text-gray-700">{sourceText}</span>
            </div>
          </div>

          <Image
            src={imageUrl}
            alt={title}
            width={800}
            height={450}
            className="rounded-xl w-full h-36 sm:h-40 md:h-44 object-cover"
          />
        </div>
      </div>
    </div>
  );
}
