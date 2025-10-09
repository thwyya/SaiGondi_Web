// SearchBox.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiSliders } from "react-icons/fi";
import Button from "./Button";

interface SearchBoxProps {
  searchType?: 'all' | 'destinations' | 'blogs';
}

const SearchBox: React.FC<SearchBoxProps> = ({ searchType = 'all' }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery === "") {
      setError("Vui lòng nhập nội dung tìm kiếm.");
      return;
    }

    if (trimmedQuery.length < 3) {
      setError("Nội dung tìm kiếm phải có ít nhất 3 ký tự.");
      return;
    }

    setError(null);
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}&type=${searchType}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (error) {
      setError(null);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative bg-transparent flex flex-col items-center w-full py-12 sm:py-16 px-4">
      <div className="bg-[var(--background)] rounded-2xl shadow-md flex items-center w-full max-w-7xl gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="relative flex-1">
          <span className="absolute -top-2.5 sm:-top-3 left-2.5 sm:left-3 bg-[var(--background)] px-1 text-[var(--primary)] text-xs sm:text-sm font-medium">
            Tìm kiếm
          </span>

          <FiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)] w-4 h-4 sm:w-5 sm:h-5" />
          <FiSliders className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)] w-4 h-4 sm:w-5 sm:h-5" />

          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Tìm kiếm địa điểm, quán ăn, khu vui chơi xung quanh bạn…"
            className={`w-full border ${error ? 'border-red-500' : 'border-[var(--primary)]'} rounded-md
                       pl-8 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3
                       text-xs sm:text-sm text-[var(--foreground)]
                       placeholder:text-[11px] sm:placeholder:text-sm
                       focus:outline-none focus:border-[var(--primary)]
                       focus:ring-1 focus:ring-[var(--primary)] transition`}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="flex items-center justify-center gap-2
                     px-4 sm:px-6 py-2.5 sm:py-3
                     text-xs sm:text-sm font-semibold rounded-full"
        >
          TÌM KIẾM
        </Button>
      </div>
      {error && (
        <div className="w-full max-w-7xl mt-2">
          <p className="text-red-500 text-xs sm:text-sm text-left ml-4">{error}</p>
        </div>
      )}
    </form>
  );
};

export default SearchBox;

