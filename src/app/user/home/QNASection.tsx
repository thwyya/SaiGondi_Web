'use client';

import QnaCard from '@/components/cards/QnaCard';
import Button from '@/components/ui/Button';
import { qnaData } from '@/data/qnaData';
import Link from 'next/link';

export default function QNASection() {
  return (
    <section className="w-full py-16 sm:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 py-2 sm:py-4">
              Q/A - Hỏi đáp du lịch
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              Các câu hỏi bàn luận về Du lịch
            </p>
          </div>

          <div className="w-full sm:w-auto self-end sm:self-auto">
            <div className="flex justify-end">
              <Link href="/user/question">
                <Button
                  variant="outline-primary"
                  className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 h-fit rounded-none"
                >
                  Xem tất cả
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-5 sm:gap-x-6 gap-y-8 sm:gap-y-10">
          {qnaData.slice(0, 4).map((item) => (
            <Link key={item.id} href={`/user/question/${item.id}`}>
              <QnaCard
                title={item.title}
                description={item.description}
                author={item.author}
                sourceText={item.source}
                imageUrl={item.image}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
