"use client";

import { TopUser } from "@/app/assets/data/topPlace";
import { FaChevronRight } from "react-icons/fa";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";

export default function TopUsers({ topUsers }: { topUsers: TopUser[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setCurrentUserId(decoded.id);
      } catch (err) {
        console.error("Decode token error:", err);
      }
    }

    console.log("TopUsers data:", topUsers);
  }, [topUsers]);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 150, behavior: "smooth" });
    }
  };

  const getLatestBadge = (badges: any[] = []) => {
    if (!badges || badges.length === 0) return null;

    const earnedBadges = badges.filter(
      (b) => b.userProgress?.status === "earned"
    );

    if (earnedBadges.length > 0) {
      return earnedBadges.sort(
        (a, b) =>
          new Date(b.userProgress?.updatedAt || 0).getTime() -
          new Date(a.userProgress?.updatedAt || 0).getTime()
      )[0];
    }

    return badges[badges.length - 1];
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col m-6">
      <h2 className="text-[#343C6A] text-lg font-bold mb-4">
        TOP 5 NGƯỜI DÙNG NỔI BẬT
      </h2>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex items-center gap-10 overflow-x-auto scrollbar-hide pr-12"
        >
          {topUsers.map((user, i) => {
            const isCurrentUser =
              currentUserId && user.userId === currentUserId;
            const profileLink = isCurrentUser
              ? "/user/profile"
              : `/user/profile/${user.userId}`;

            const latestBadge = getLatestBadge(user.badges || []);

            return (
              <Link
                key={i}
                href={profileLink}
                className="flex flex-col items-center justify-center gap-2 min-w-[80px] hover:opacity-80 transition"
              >
                <Image
                  src={user.avatar || "/Image.svg"}
                  alt={user.fullName}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full object-cover border"
                />
                <h6
                  className="font-medium text-sm text-center max-w-[100px] truncate"
                  title={user.fullName}
                >
                  {user.fullName}
                </h6>
                <p
                  className="text-xs text-gray-500 text-center max-w-[100px] truncate"
                  title={latestBadge?.name || "Thành viên"}
                >
                  {latestBadge?.name || "Thành viên"}
                </p>
              </Link>
            );
          })}
        </div>
        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10
                     flex items-center justify-center h-10 w-10 rounded-full
                     bg-gray-100 hover:bg-gray-200 shadow-md"
        >
          <FaChevronRight className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}
