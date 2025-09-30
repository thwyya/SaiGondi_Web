"use client";

import Image from "next/image";
import { FaChevronDown } from "react-icons/fa6";
import { RefObject } from "react";

interface AdminHeaderProps {
  firstName: string;
  avatarUrl: string;
  avatarOpen: boolean;
  setAvatarOpen: (value: boolean) => void;
 avatarRef: RefObject<HTMLDivElement | null>;
  handleLogout: () => void;
}

export default function AdminHeader({
  firstName,
  avatarUrl,
  avatarOpen,
  setAvatarOpen,
  avatarRef,
  handleLogout,
}: AdminHeaderProps) {
  return (
    <div className="flex justify-end mt-6 px-4">
      <div
        ref={avatarRef}
        className="relative flex items-center gap-2 cursor-pointer"
        onClick={() => setAvatarOpen(!avatarOpen)}
      >
        <Image
          src={avatarUrl}
          alt="Avatar"
          width={32}
          height={32}
          className="rounded-full object-cover"
        />
        <span className="font-medium">{firstName}</span>
        <FaChevronDown className="text-gray-500" size={14} />

        {avatarOpen && (
          <div className="absolute right-0 top-[110%] w-44 bg-white rounded-xl shadow-lg py-1 border border-gray-100 z-50">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 rounded-xl"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
