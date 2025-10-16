'use client';
import { Popover, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";

interface FilterDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  isSearchable?: boolean;
}

export default function FilterDropdown({ options, value, onChange, className, isSearchable = false }: FilterDropdownProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = isSearchable && searchTerm
    ? options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <Popover className="relative w-full">
      {({ open, close }) => (
        <>
          {/* Nút bấm */}
          <Popover.Button 
            className={`flex justify-between items-center w-full gap-2 border border-gray-200 rounded-md py-2 px-3 bg-white shadow-sm text-sm ${className}`}>
            <span className="truncate">{value || "Bộ lọc"}</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
            />
          </Popover.Button>

          {/* Menu xổ xuống */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
            afterLeave={() => setSearchTerm('')} // Reset search on close
          >
            <Popover.Panel className="absolute right-0 mt-2 w-full rounded-lg bg-white shadow-lg ring-1 ring-black/5 z-50 focus:outline-none">
              {isSearchable && (
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full rounded-md border-gray-200 pl-9 pr-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
              <div className="py-1 max-h-60 overflow-y-auto">
                {filteredOptions.length > 0 ? filteredOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onChange(opt);
                      close(); // Close popover on selection
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      value === opt ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                    }`}
                  >
                    {opt}
                  </button>
                )) : (
                  <p className="text-center text-xs text-gray-500 py-4">Không có kết quả</p>
                )}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}