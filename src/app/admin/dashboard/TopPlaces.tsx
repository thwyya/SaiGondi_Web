import { TopPlace } from "@/app/assets/data/topPlace";
import { useRef } from "react";
import { FaChevronRight } from "react-icons/fa";
import Link from "next/link";

export default function TopPlaces({ topPlaces }: { topPlaces: TopPlace[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 150, behavior: "smooth" });
    }
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col m-6">
      <h2 className="text-[#343C6A] text-lg font-bold mb-4">
        TOP 5 ĐỊA ĐIỂM NỔI BẬT
      </h2>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex items-center gap-10 overflow-x-auto scrollbar-hide pr-20 pl-2"
        >
          {topPlaces.map((place, i) => (
            <Link
              key={i}
              href={`/user/destination/${place._id}`}
              className="flex flex-col items-center justify-center gap-2 min-w-[80px]"
            >
              <img
                src={place.images?.[0] || "/default.png"}
                alt={place.name}
                className="h-16 w-16 rounded-full object-cover border"
              />
              <h6
                className="font-medium text-sm text-center max-w-[100px] truncate"
                title={place.name}
              >
                {place.name}
              </h6>
              <p
                className="text-xs text-gray-500 text-center max-w-[100px] truncate"
                title={place.address}
              >
                {place.address || ""}
              </p>
            </Link>
          ))}
        </div>

        <button
          onClick={scrollRight}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20
                    flex items-center justify-center h-10 w-10 rounded-full
                    bg-gray-100 hover:bg-gray-200 shadow-md"
        >
          <FaChevronRight className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}
