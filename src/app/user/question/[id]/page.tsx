'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { BiLike } from 'react-icons/bi';
import { FaRegCommentAlt } from 'react-icons/fa';
import { questionApi } from '@/lib/question/questionApi';

export default function QnaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await questionApi.getQuestionById(id);
        setQuestion(res);
        setAnswers(res.answers || []);
      } catch (err) {
        console.error('Lỗi load chi tiết câu hỏi', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleSubmit = async () => {
    if (!newAnswer.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/auth/login');
        return;
      }
      const res = await questionApi.addAnswer(id, { content: newAnswer });
      setAnswers([res, ...answers]);
      setNewAnswer('');
    } catch (err) {
      console.error('Lỗi gửi câu trả lời', err);
    }
  };

  const handleLike = async () => {
    try {
      await questionApi.likeQuestion(id);
      const res = await questionApi.getQuestionById(id);
      setQuestion(res);
    } catch (err) {
      console.error('Lỗi like câu hỏi', err);
    }
  };

  if (loading) {
    return <p className="p-6 text-gray-500">Đang tải...</p>;
  }

  if (!question) {
    return (
      <div className="w-full px-6 py-12">
        <p className="text-red-500 font-medium">Không tìm thấy câu hỏi!</p>
      </div>
    );
  }

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
          <div className="flex items-center gap-3 mb-4">
            <img
              src={question.author?.avatar || '/images/default.jpg'}
              alt={question.author?.firstName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium">
                {question.author?.firstName} {question.author?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(question.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 break-words">
            {question.title}
          </h1>

          <div className="flex gap-8 text-sm text-gray-600">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <BiLike /> {question.totalLikes || 0}
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
            <div key={ans._id} className="rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={ans.author?.avatar || '/images/default.jpg'}
                  alt={ans.author?.firstName}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium">
                    {ans.author?.firstName} {ans.author?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(ans.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-800 whitespace-pre-line break-words">
                {ans.content}
              </p>
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
