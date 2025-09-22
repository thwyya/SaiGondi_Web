'use client';

import { useState } from "react";
import { FiFilter } from "react-icons/fi";

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
        <FiFilter />
        Bộ lọc
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-20">
          <ul className="py-1 text-sm text-gray-700">
            <li
              onClick={() => {
                onSelect("mine");
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              Bài đăng của bạn
            </li>
            <li
              onClick={() => {
                onSelect("shared");
                setOpen(false);
              }}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              Bài đăng đã chia sẻ
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
