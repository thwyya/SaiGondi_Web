'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import { qnaData } from '@/data/qnaData';
import { BiDislike, BiLike } from 'react-icons/bi';
import { FaRegCommentAlt } from 'react-icons/fa';

export default function QnaDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const question = qnaData.find((q) => q.id === id);

  const [answers, setAnswers] = useState(question?.answers || []);
  const [newAnswer, setNewAnswer] = useState('');
  const [likes, setLikes] = useState(question?.likes || 0);
  const [dislikes, setDislikes] = useState(0);

  if (!question) {
    return (
      <div className="w-full px-6 py-12">
        <p className="text-red-500 font-medium">Không tìm thấy câu hỏi!</p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!newAnswer.trim()) return;
    const newEntry = {
      id: answers.length + 1,
      author: 'Bạn',
      avatar: '/city-2.svg',
      content: newAnswer,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAnswers([newEntry, ...answers]);
    setNewAnswer('');
  };

  const handleLike = () => setLikes((prev) => prev + 1);
  const handleDislike = () => setDislikes((prev) => prev + 1);

  return (
    <section className="w-full px-6 py-12 relative overflow-hidden">
      <div
        className="absolute w-[500px] h-[450px] bg-[var(--secondary)] opacity-50 blur-[250px] pointer-events-none"
        style={{ top: '400px', left: '-250px' }}
      />
      <div
        className="absolute w-[500px] h-[550px] bg-[var(--primary)] opacity-50 blur-[250px] pointer-events-none"
        style={{ top: '70px', left: '1470px' }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="rounded-lg p-6 mb-10 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {question.title}
          </h1>
          <div className="flex items-center gap-3 mb-4">
             <img
                src={question.image} 
                alt={question.author}
                className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium">{question.author}</p>
              <p className="text-xs text-gray-500">
                {question.createdAt} • {question.source}
              </p>
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-line mb-4">
            {question.description}
          </p>
          <div className="flex gap-8 text-sm text-gray-600">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <BiLike /> {likes}
            </button>
            <button
              onClick={handleDislike}
              className="flex items-center gap-1 hover:text-red-500"
            >
              <BiDislike /> {dislikes}
            </button>
            <span className="flex items-center gap-1 text-red-500 font-medium">
              <FaRegCommentAlt /> {answers.length} Trả lời
            </span>
          </div>
        </div>
        <div className="space-y-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Câu trả lời ({answers.length})
          </h3>
          {answers.map((ans) => (
            <div key={ans.id} className="rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={ans.avatar}
                  alt={ans.author}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium">{ans.author}</p>
                  <p className="text-xs text-gray-500">{ans.createdAt}</p>
                </div>
              </div>
              <p className="text-gray-800 whitespace-pre-line">{ans.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h4 className="text-lg sm:text-xl font-medium mb-3">
            Viết câu trả lời của bạn
          </h4>
          <textarea
            placeholder="Chia sẻ kinh nghiệm hoặc góp ý của bạn..."
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            className="w-full p-3 border rounded-lg mb-3 focus:outline-none focus:border-gray-400"
            rows={4}
          />
          <Button onClick={handleSubmit}>Gửi trả lời</Button>
        </div>
      </div>
    </section>
  );
}
