'use client';

import { useEffect, useState } from 'react';
import TrendCard from '@/components/cards/TrendCard';
import { placeApi } from '@/lib/place/placeApi';

export default function TrendSection() {
  const [topRated, setTopRated] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const places = await placeApi.getAll();

        if (!Array.isArray(places)) {
          console.error("API /places không trả về mảng:", places);
          return;
        }

        const topRatedPlaces = [...places]
          .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
          .slice(0, 5);

        const trendingPlaces = [...places]
          .sort((a, b) => {
            const ratingDiff = (b.avgRating || 0) - (a.avgRating || 0);
            if (ratingDiff !== 0) return ratingDiff;
            return (b.totalCheckins || 0) - (a.totalCheckins || 0);
          })
          .slice(0, 5);

        setTopRated(topRatedPlaces);
        setTrending(trendingPlaces);
      } catch (err) {
        console.error('Lỗi khi load places:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="px-4 sm:px-6 py-12 md:py-16">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 md:text-left">
          XU HƯỚNG
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
          <div>
            <div className="mb-3 sm:mb-4">
              <p className="text-gray-600 font-inter text-center md:text-left">
                Top 5 điểm đến được yêu thích
              </p>
            </div>
            <div className="w-full max-w-xl mx-auto md:mx-0">
              <div className="flex flex-col gap-4 sm:gap-5">
                {topRated.map((place, index) => (
                  <div key={place._id} className="px-0 sm:px-2 md:px-4">
                    <TrendCard index={index} data={place} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="max-w-lg md:ml-auto px-0 md:px-10 mb-3 sm:mb-5 text-center md:text-right">
              <p className="text-gray-600 font-inter mx-6">
                {'5 xu hướng du lịch đang "gây bão"'}
              </p>
            </div>
            <div className="w-full h-full max-w-xl mx-auto md:mx-0">
              <div className="flex flex-col gap-4 sm:gap-5">
                {trending.map((place, index) => (
                  <div key={place._id} className="px-0 sm:px-2 md:px-4">
                    <TrendCard index={index} data={place} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
