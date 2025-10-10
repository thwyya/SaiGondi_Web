'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getTopSearches } from '@/services/searchService';

const HotSearchSection = () => {
  const [topSearches, setTopSearches] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopSearches = async () => {
      try {
        const data = await getTopSearches();
        setTopSearches(data);
      } catch (error) {
        console.error("Failed to fetch top searches:", error);
        setTopSearches([]); // Ensure state is an array on error
      }
    };

    fetchTopSearches();
  }, []);

  return (
    <section className="px-4 py-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 xl:gap-16 items-center relative">
        <div className="space-y-6 z-10">
          <div>
            <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold font-inter text-[var(--black-1)] mb-1">
              Tìm kiếm hot
            </h2>
            <p className="text-xs md:text-sm xl:text-base font-inter text-[var(--gray-3)]">
              Những lựa chọn tốt nhất của khách hàng chúng tôi
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {topSearches.map((item, index) => (
              <Link href={`/search?q=${item.keyword}`} key={index}>
                <div
                  className={`flex items-center gap-3 md:gap-4 xl:gap-5 p-3 md:p-4 xl:p-5 rounded-2xl transition bg-white/60 hover:bg-white hover:shadow-md cursor-pointer`}
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 xl:w-18 xl:h-18 rounded-xl flex items-center justify-center shrink-0">
                    <Image
                      src={"/location.svg"} // Using a generic icon for all
                      alt="icon"
                      width={64}
                      height={64}
                      className="w-8 h-8 md:w-12 md:h-12 xl:w-14 xl:h-14"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base xl:text-lg font-semibold text-[var(--black-1)]">
                      {item.keyword}
                    </h3>
                    <p className="text-xs md:text-sm xl:text-base text-[var(--gray-3)]">
                      {`Có ${item.search_count} lượt tìm kiếm`}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="relative w-full h-[380px] sm:h-[420px] md:h-[520px] lg:h-[560px] xl:h-[620px] 2xl:h-[680px] pb-8 md:pb-16">
          <div
            className="
              absolute top-[-20px] left-[140px]            /* mobile */
              w-[200px] h-[140px] z-0

              md:top-[-45px] md:left-[200px] md:w-[240px] md:h-[170px]         /* tablet */
              lg:-top-14 lg:left-[280px] lg:w-[280px] lg:h-[200px]             /* laptop 1024–1279 */
              xl:-top-18 xl:left-[320px] xl:w-[320px] xl:h-[230px]             /* desktop 1280–1535 */
              2xl:-top-26 2xl:left-[400px] 2xl:w-[360px] 2xl:h-[260px]         /* >=1536 */
            "
          >
            <Image src="/city-bg.svg" alt="Background" fill className="object-cover rounded-2xl" />
          </div>

          <div
            className="
              absolute top-[30px] left-[3px]             
              w-[220px] h-[260px]
              rounded-2xl overflow-hidden shadow-xl z-10

              md:top-0 md:left-[20px] md:w-[260px] md:h-[320px]               
              lg:top-0 lg:right-[100px] lg:left-auto lg:w-[300px] lg:h-[350px] 
              xl:top-[-10px] xl:right-[140px] xl:w-[340px] xl:h-[420px]        
              2xl:top-[-29px] 2xl:right-[110px] 2xl:w-[360px] 2xl:h-[440px]   
            "
          >
            <Image src="/city-1.svg" alt="City 1" fill className="object-cover" />
          </div>

          <div
            className="
              absolute top-[180px] left-[70px]           
              w-[220px] h-[260px]
              rounded-2xl overflow-hidden shadow-xl z-20

              md:top-[200px] md:left-[110px] md:w-[250px] md:h-[300px]       
              lg:bottom-0 lg:left-40 lg:top-auto lg:w-[300px] lg:h-[350px] lg:translate-y-10
              xl:bottom-[-10px] xl:left-72 xl:w-[340px] xl:h-[420px] xl:translate-y-12       
              2xl:bottom-[5px] 2xl:left-62 2xl:w-[360px] 2xl:h-[440px] 2xl:translate-y-14 
            "
          >
            <Image src="/city-2.svg" alt="City 2" fill className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotSearchSection;
