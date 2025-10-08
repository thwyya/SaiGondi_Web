'use client';

import React from 'react';
import Image from 'next/image';

const services = [
  { title: 'Tính thời tiết', description: 'Xem dự báo thời tiết nhanh và chính xác cho điểm đến của bạn.', icon: '/weather.svg' },
  { title: 'Hướng dẫn du lịch tốt nhất', description: 'Khám phá địa điểm, ẩm thực và trải nghiệm thú vị.', icon: '/guide.svg' },
  { title: 'Mạng xã hội du lịch', description: 'Kết nối và chia sẻ hành trình với cộng đồng yêu du lịch.', icon: '/social.svg' },
];

const ServiceSection = () => {
  return (
    <section className="relative bg-transparent py-14 sm:py-20 px-4">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          
          <div className="w-full lg:w-[320px] flex-shrink-0 text-center lg:text-left">
            <p className="text-[var(--error)] font-medium font-inter text-lg sm:text-xl mb-2">
              Dịch vụ của chúng tôi
            </p>
            <h2 className="font-bold font-inter text-[22px] sm:text-[28px] leading-snug text-[var(--black-1)]">
              Khám phá, kết nối <br /> và trải nghiệm dễ dàng
            </h2>
          </div>

          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-6 lg:mt-0">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  className="bg-white w-full rounded-xl px-4 sm:px-5 py-5 sm:py-6 text-left
                             border-r-2 border-b-2 border-[var(--secondary)]
                             transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 mb-4 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        'radial-gradient(circle, rgba(208,228,255,0.9) 40%, transparent 80%)',
                      mixBlendMode: 'multiply',
                    }}
                  >
                    <Image src={service.icon} alt={service.title} width={22} height={22} className="sm:w-[24px] sm:h-[24px]" />
                  </div>

                  <h3 className="text-sm sm:text-base font-medium text-[var(--black-1)] mb-1">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--gray-3)] leading-relaxed">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ServiceSection;
