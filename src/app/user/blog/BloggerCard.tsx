'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type BloggerCardProps = {
  _id?: string;
  avatar: string;
  name: string;
  description: string;
  facebookLink?: string;
  zaloLink?: string;
};

const BloggerCard = ({
  _id,
  avatar,
  name,
  description,
}: BloggerCardProps) => {
  return (
    <div className="flex items-start gap-4">
      <Link href={`/user/profile/${_id}`} className="w-16 h-16 relative rounded-full overflow-hidden flex-shrink-0">
        <Image src={avatar} alt={name} fill className="object-cover" />
      </Link>
      <div>
        <Link href={`/user/profile/${_id}`} className="font-semibold text-base">{name}</Link>
        <p className="text-sm text-[var(--gray-2)] leading-tight">
          {description}
        </p>
      </div>
    </div>
  );
};

export default BloggerCard;
