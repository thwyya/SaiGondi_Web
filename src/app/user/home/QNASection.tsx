'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import QnaCard from '@/components/cards/QnaCard';
import { questionApi } from '@/lib/question/questionApi';
import AskQuestionModal from '../question/AskQuestionModal';

export default function QNASection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const images = [
    '/qa_1.svg',
    '/qa_2.svg',
    '/qa_3.svg',
    '/qa.svg'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await questionApi.getQuestions(1, 4);
        setQuestions(res.questions);
      } catch (err) {
        console.error('Lỗi load questions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
            <div className="flex justify-end gap-3">
              <Link href="/user/question">
                <Button
                  variant="outline-primary"
                  className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 h-fit rounded-none"
                >
                  Xem tất cả
                </Button>
              </Link>
              <Button
                variant="outline-primary"
                className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 h-fit rounded-none"
                onClick={() => setIsModalOpen(true)}
              >
                Đặt câu hỏi
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Đang tải...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-8 sm:gap-x-10 gap-y-10 sm:gap-y-12 items-stretch">
            {questions.slice(0, 4).map((item, index) => (
              <Link key={item._id} href={`/user/question/${item._id}`}>
                <QnaCard
                  title={item.title}
                  description={item.title}
                  author={`${item.author?.firstName || ''} ${item.author?.lastName || ''}`}
                  sourceText="Google"
                  imageUrl={images[index % images.length]}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
      <AskQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newQuestion) => {
          setQuestions((prev) => [newQuestion, ...prev].slice(0, 4));
        }}
      />
    </section>
  );
}
