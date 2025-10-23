"use client"
import React, { ReactNode, KeyboardEvent} from "react";


interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  filterSlot?: ReactNode;
}

const SearchBar = ({ placeholder = '', onSearch, filterSlot }: SearchBarProps) => {

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        const target = event.target as HTMLInputElement;
        onSearch?.(target.value);
      }
    }

  return (
    <div className='flex flex-col md:flex-row items-center my-8 gap-4 w-full'>
      <div className='flex-1 text-sm'>
        <div className="search__bar relative w-full md:max-w-xl">
          <span className='flex items-center absolute inset-y-0 left-4'><i className="ri-search-line"></i></span>
          <input
            type="text"
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            aria-label="Search"
            className='border border-gray-300 rounded-xl py-2 pl-12 w-full'
          />
        </div>
      </div>
      <div className='flex items-center justify-end text-sm w-auto md:min-w-[220px] whitespace-nowrap'>
        {filterSlot}
      </div>
    </div>
  )
}

export default SearchBar