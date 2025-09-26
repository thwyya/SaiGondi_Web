'use client';
import { useState } from "react";
import Image from "next/image";

export interface FilterDropdownProps {
  onSelect: (value: string) => void;
}

export default function FilterDropdown({ onSelect }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-3 py-2 bg-white rounded-md shadow hover:bg-gray-50"
        onClick={() => setOpen(!open)}
      >
        <Image src="/filter.svg" alt="Filter" width={18} height={18} />
        Bộ lọc
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg z-20 p-2">
          <ul className="py-1 text-sm text-gray-700">
            <li
              onClick={() => {
                onSelect("mine");
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <Image src="/me.svg" alt="Mine" width={18} height={18} />
              Bài đăng của bạn
            </li>
            <li
              onClick={() => {
                onSelect("shared");
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <Image src="/share.svg" alt="Shared" width={18} height={18} />
              Bài đăng đã chia sẻ
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
