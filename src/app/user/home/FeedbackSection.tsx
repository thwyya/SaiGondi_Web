'use client';

import { useState } from 'react';
import { FaQuoteLeft } from 'react-icons/fa';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

const testimonials = [
  {
    name: 'THU HIỀN',
    content:
      'SÀI GÒN điểm đến nghỉ dưỡng và vui chơi trên bản đồ Việt Nam,\nkhông chỉ thu hút với nhiều cảnh đẹp nơi đây còn tạo ấn tượng với nhiều điểm vui chơi cùng thú cưng thú vị',
  },
  { 
    name: 'VĂN MINH', 
    content: 'Tôi rất ấn tượng với sự đa dạng và không khí năng động tại Sài Gòn.\nChắc chắn sẽ quay lại!' 
  },
  { 
    name: 'LAN ANH', 
    content: 'Một nơi tuyệt vời cho cả gia đình.\nTrẻ nhỏ cực kỳ thích thú với các hoạt động giải trí ở đây.' 
  },
];

export default function FeedbackSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => setCurrentIndex(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
  const handleNext = () => setCurrentIndex(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));

  const t = testimonials[currentIndex];

  return (
    <section className="relative py-14 sm:py-16 md:py-20 px-4">
      <div className="relative max-w-3xl mx-auto text-center">
        <FaQuoteLeft className="mx-auto mb-4 sm:mb-6 text-3xl sm:text-4xl text-[var(--gray-3)]" />

        <h4 className="font-inter text-[var(--gray-3)] mb-2 text-sm sm:text-base md:text-lg">
          {t.name}
        </h4>
        <p className="font-inter text-[var(--gray-3)] leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line">
          {t.content}
        </p>
        <button
          aria-label="Previous"
          onClick={handlePrev}
          className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -left-3 md:-left-6 lg:-left-18 w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-300 items-center justify-center hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <IoIosArrowBack className="text-[var(--gray-3)] text-2xl md:text-3xl" />
        </button>
        <button
          aria-label="Next"
          onClick={handleNext}
          className="hidden sm:flex absolute top-1/2 -translate-y-1/2 -right-3 md:-right-6 lg:-right-18 w-10 h-10 md:w-12 md:h-12 rounded-full border border-gray-300 items-center justify-center hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          <IoIosArrowForward className="text-[var(--gray-3)] text-2xl md:text-3xl" />
        </button>

        <div className="sm:hidden mt-6 flex items-center justify-center gap-4">
          <button
            aria-label="Previous"
            onClick={handlePrev}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
          >
            <IoIosArrowBack className="text-[var(--gray-3)] text-2xl" />
          </button>
          <button
            aria-label="Next"
            onClick={handleNext}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
          >
            <IoIosArrowForward className="text-[var(--gray-3)] text-2xl" />
          </button>
        </div>
      </div>
    </section>
  );
}
