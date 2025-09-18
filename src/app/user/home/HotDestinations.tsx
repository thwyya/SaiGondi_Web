'use client';

import React from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { HiLocationMarker } from 'react-icons/hi';

const destinations = [
  { _id: 'dest_1', title: 'PHƯỜNG THỦ ĐỨC', location: 'Phường Bàn Cờ', distance: 'Cách bạn 90m', image: '/hot-destination.svg' },
  { _id: 'dest_2', title: 'PHƯỜNG BÀN CỜ', location: 'Phường Bàn Cờ', distance: 'Cách bạn 90m', image: '/hot-destination.svg' },
  { _id: 'dest_3', title: 'PHƯỜNG BẾN NGHÉ', location: 'Phường Bàn Cờ', distance: 'Cách bạn 90m', image: '/hot-destination.svg' },
  { _id: 'dest_4', title: 'PHƯỜNG LINH XUÂN', location: 'Phường Bàn Cờ', distance: 'Cách bạn 90m', image: '/hot-destination.svg' },
];

const HotDestinations = () => {
  return (
    <section className="py-14 sm:py-16 px-4">
      <div className="max-w-7xl mx-auto relative">
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-inter text-[var(--black-1)] mb-1">
              Điểm đến hot
            </h2>
            <p className="text-xs sm:text-sm text-[var(--gray-3)] font-inter">
              Kỳ nghỉ giúp bạn có trải nghiệm thú vị tại Sài Gòn!
            </p>
          </div>

          <Button
            variant="outline-primary"
            className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 h-fit rounded-none sm:static absolute right-4 top-0"
          >
            Xem tất cả
          </Button>
        </div>

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
  {destinations.map((item, index) => (
    <div
      key={index}
      className="flex flex-col h-full rounded-2xl bg-white/10 backdrop-blur-[12px] shadow-lg hover:shadow-xl transition border-2 border-white overflow-hidden"
    >
      <div className="relative w-full aspect-[4/3]">
        <Image src={item.image} alt={item.title} fill className="object-cover" />
      </div>

      <div className="flex flex-col justify-between flex-1 p-4 sm:p-5">
        <div className="space-y-1.5 sm:space-y-2.5">
          <p className="text-[11px] sm:text-xs text-[var(--gray-3)] flex items-center gap-1">
            <HiLocationMarker className="w-3.5 h-3.5 text-[var(--primary)]" />
            {item.location}
          </p>
          <h3 className="text-sm sm:text-base font-bold text-[var(--black-1)]">
            {item.title}
          </h3>
          <p className="text-[11px] sm:text-xs text-[var(--gray-3)]">{item.distance}</p>
        </div>

        <div className="mt-3 sm:mt-4">
          <Button
            variant="outline-primary"
            className="bg-[var(--white)] text-[var(--primary)] text-xs sm:text-sm font-medium px-4 py-1.5 w-full justify-center rounded-none border-none"
          >
            XEM CHI TIẾT
          </Button>
        </div>
      </div>
    </div>
  ))}
</div>

      </div>
    </section>
  );
};

export default HotDestinations;
