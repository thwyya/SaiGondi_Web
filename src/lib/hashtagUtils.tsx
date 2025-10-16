import React from "react";
import Link from "next/link";

export const renderWithHashtags = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(#\w+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      const tag = part.substring(1);
      return (
        <Link key={index} href={`/search?tag=${tag}&type=blogs`} className="text-blue-600 hover:underline font-medium">
          {part}
        </Link>
      );
    }
    return part;
  });
};