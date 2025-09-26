'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { HiLocationMarker } from 'react-icons/hi';
import { checkinApi } from '@/lib/checkin/checkinApi';
import { useRouter } from 'next/navigation';

interface Destination {
  placeId: string;
  name: string;
  address: string;
  image?: string;
  totalCheckins: number;
}

const HotDestinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const hotPlaces = await checkinApi.getHotPlaces();
        setDestinations(hotPlaces);
      } catch (err) {
        console.error('Error fetching hot places:', err);
      }
    };

    fetchData();
  }, []);

  const limitedDestinations = destinations.slice(0, 4);

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
            onClick={() => router.push('/user/destination?type=hot')}
            className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 h-fit rounded-none sm:static absolute right-4 top-0"
          >
            Xem tất cả
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {limitedDestinations.map((item) => (
            <div
              key={item.placeId}
              className="flex flex-col h-full rounded-2xl bg-white/10 backdrop-blur-[12px] shadow-lg hover:shadow-xl transition border-2 border-white overflow-hidden"
            >
              <div className="w-full aspect-[4/3] flex justify-center items-center">
                <Image
                  src={item.image || '/hot-destination.svg'}
                  alt={item.name}
                  width={350}
                  height={150}
                  className="object-cover rounded-3xl"
                />
              </div>

              <div className="flex flex-col justify-between flex-1 p-4 sm:p-5">
                <div className="space-y-1.5 sm:space-y-2.5">
                  <p className="text-[11px] sm:text-xs text-[var(--gray-3)] flex items-center gap-1">
                    <HiLocationMarker className="w-3.5 h-3.5 text-[var(--primary)]" />
                    {item.address}
                  </p>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--black-1)]">
                    {item.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[var(--gray-3)]">
                    {item.totalCheckins} lượt checkin
                  </p>
                </div>

                <div className="mt-3 sm:mt-4">
                  <Button
                    variant="outline-primary"
                    onClick={() => router.push(`/user/destination/${item.placeId}`)}
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
