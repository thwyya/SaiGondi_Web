"use client";

import React from "react";
import { FiSearch, FiSliders } from "react-icons/fi";
import Button from "./Button";

const SearchBox = () => {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearch = () => {
    if (searchQuery.trim() === "") return;
    window.location.href = `/search?query=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="relative bg-transparent flex justify-center py-12 sm:py-16 px-4">
      <div className="bg-[var(--background)] rounded-2xl shadow-md flex items-center w-full max-w-7xl gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="relative flex-1">
          <span className="absolute -top-2.5 sm:-top-3 left-2.5 sm:left-3 bg-[var(--background)] px-1 text-[var(--primary)] text-xs sm:text-sm font-medium">
            Tìm kiếm
          </span>

          <FiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)] w-4 h-4 sm:w-5 sm:h-5" />

          <FiSliders className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-[var(--foreground)] w-4 h-4 sm:w-5 sm:h-5" />

          <input
            type="text"
            placeholder="Tìm kiếm địa điểm, quán ăn, khu vui chơi xung quanh bạn…"
            className="w-full border border-[var(--primary)] rounded-md
                       pl-8 sm:pl-10 pr-8 sm:pr-10 py-2.5 sm:py-3
                       text-xs sm:text-sm text-[var(--foreground)]
                       placeholder:text-[11px] sm:placeholder:text-sm
                       focus:outline-none focus:border-[var(--primary)]
                       focus:ring-1 focus:ring-[var(--primary)] transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button
          variant="primary"
          className="flex items-center justify-center gap-2
                     px-4 sm:px-6 py-2.5 sm:py-3
                     text-xs sm:text-sm font-semibold rounded-full"
          onClick={handleSearch}
        >
          TÌM KIẾM
        </Button>
      </div>
    </div>
  );
};

export default SearchBox;
