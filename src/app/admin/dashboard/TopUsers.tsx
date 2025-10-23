"use client";

import { TopUser } from "@/app/assets/data/topPlace";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";

export default function TopUsers({ topUsers }: { topUsers: TopUser[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  }, []);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleCheck = () => {
      checkScroll();
    };

    requestAnimationFrame(handleCheck);
    setTimeout(handleCheck, 200);

    el.addEventListener("scroll", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
    };
  }, [topUsers]);

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
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col m-3 relative">
      <h2 className="text-[#343C6A] text-lg font-bold mb-4">
        TOP 5 NGƯỜI DÙNG NỔI BẬT
      </h2>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex items-center gap-6 overflow-x-auto scrollbar-hide px-6 pb-5"
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

        {/* Nút trái */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-0 bottom-0 mx-1 my-auto 
                       flex items-center justify-center w-10 h-10
                       bg-gray-100 hover:bg-gray-200 shadow-md rounded-full z-10"
          >
            <FaChevronLeft className="text-gray-600" />
          </button>
        )}

        {/* Nút phải */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-0 bottom-0 mx-1 my-auto 
                       flex items-center justify-center w-10 h-10
                       bg-gray-100 hover:bg-gray-200 shadow-md rounded-full z-10"
          >
            <FaChevronRight className="text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}
