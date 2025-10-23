'use client';

import React from 'react';
import { getPaginationRange } from "./pagination";

interface GridPaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function GridPagination({ totalItems, itemsPerPage, currentPage, onPageChange }: GridPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pages = getPaginationRange(currentPage, totalPages);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
        {/* Previous */}
        <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded disabled:opacity-50 bg-[#DEDEFA] text-[var(--primary)] font-bold"
        >
            <i className="ri-arrow-left-s-line"></i>
        </button>

        {/* Pages */}
        {pages.map((p, idx) =>
            p === "..." ? (
            <span key={idx} className="px-2">
                ...
            </span>
            ) : (
            <button
                key={idx}
                onClick={() => onPageChange(p as number)}
                className={`px-3 py-1 rounded font-bold ${
                p === currentPage ? "bg-[var(--primary)] text-white" : "bg-[#DEDEFA] text-[var(--primary)]"
                }`}
            >
                {p}
            </button>
            )
        )}

        {/* Next */}
        <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 rounded disabled:opacity-50 bg-[#DEDEFA] text-[var(--primary)] font-bold"
        >
            <i className="ri-arrow-right-s-line"></i>
        </button>
    </div>
  );
}
