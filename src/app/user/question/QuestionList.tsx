'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { BiLike, BiDislike } from 'react-icons/bi';
import { FaRegCommentAlt } from "react-icons/fa";
import { qnaData } from '@/data/qnaData';

export default function QuestionList() {
  const [filter, setFilter] = useState<'all' | 'answered' | 'unanswered'>('all');

  // state lưu likes / dislikes (độc lập với qnaData gốc)
  const [likes, setLikes] = useState<{ [key: number]: number }>(
    Object.fromEntries(qnaData.map(q => [q.id, q.likes]))
  );
  const [dislikes, setDislikes] = useState<{ [key: number]: number }>(
    Object.fromEntries(qnaData.map(q => [q.id, 0]))
  );

  const filteredQuestions = qnaData.filter((q) => {
    if (filter === 'answered') return q.answers.length > 0;
    if (filter === 'unanswered') return q.answers.length === 0;
    return true;
  });

  const handleLike = (id: number) => {
    setLikes(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const handleDislike = (id: number) => {
    setDislikes(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Bộ lọc */}
      <div className="flex bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        {['all', 'answered', 'unanswered'].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`flex-1 px-4 py-3 text-center text-sm font-medium relative ${
              filter === key ? 'text-blue-600' : 'text-gray-700'
            }`}
          >
            {key === 'all'
              ? 'Tất cả'
              : key === 'answered'
              ? 'Đã trả lời'
              : 'Chưa trả lời'}
            {filter === key && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
            )}
          </button>
        ))}
      </div>

      {/* Danh sách câu hỏi */}
      <div className="space-y-12">
        {filteredQuestions.map((q) => (
          <div
            key={q.id}
            className="p-8 rounded-xl shadow-md hover:shadow-lg transition bg-white"
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <Image
                src={q.image}
                alt={q.author}
                width={42}
                height={42}
                className="rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-sm">{q.author}</h4>
                <p className="text-xs text-gray-500">{q.createdAt}</p>
              </div>
            </div>

            {/* Content */}
            <Link href={`/user/question/${q.id}`}>
              <h3 className="font-medium text-gray-900 text-base mb-2 hover:underline">
                {q.title}
              </h3>
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                {q.description}
              </p>
            </Link>

            <div className="flex items-center gap-8 text-sm text-gray-600">
              <button
                onClick={() => handleLike(q.id)}
                className="flex items-center gap-1 hover:text-blue-600"
              >
                <BiLike /> {likes[q.id]}
              </button>
              <button
                onClick={() => handleDislike(q.id)}
                className="flex items-center gap-1 hover:text-red-500"
              >
                <BiDislike /> {dislikes[q.id]}
              </button>
              <Link
                href={`/user/question/${q.id}`}
                className="flex items-center gap-1 text-red-500 font-medium hover:underline"
              >
                <FaRegCommentAlt /> {q.answers.length} trả lời
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
