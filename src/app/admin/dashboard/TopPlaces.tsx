"use client";

import { TopPlace } from "@/app/assets/data/topPlace";
import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";

export default function TopPlaces({ topPlaces }: { topPlaces: TopPlace[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  }, [topPlaces]);


  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col m-3 relative">
      <h2 className="text-[#343C6A] text-lg font-bold mb-4">
        TOP 5 ĐỊA ĐIỂM NỔI BẬT
      </h2>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex items-center gap-6 overflow-x-auto scrollbar-hide px-6 pb-5"
        >
          {topPlaces.map((place, i) => (
            <Link
              key={i}
              href={`/user/destination/${place._id}`}
              className="flex flex-col items-center justify-center gap-2 min-w-[100px]"
            >
              <img
                src={place.images?.[0] || "/default.png"}
                alt={place.name}
                className="h-16 w-16 rounded-full object-cover"
              />
              <h6
                className="font-medium text-sm text-center w-[110px] truncate"
                title={place.name}
              >
                {place.name}
              </h6>
              <p
                className="text-xs text-gray-500 text-center w-[110px] truncate"
                title={place.address}
              >
                {place.address || ""}
              </p>
            </Link>
          ))}
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
