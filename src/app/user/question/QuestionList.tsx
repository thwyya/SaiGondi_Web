'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BiLike } from 'react-icons/bi';
import { FaRegCommentAlt } from 'react-icons/fa';
import { questionApi } from '@/lib/question/questionApi';
import EditQuestionModal from './EditQuestionModal';
import { CiMenuKebab } from "react-icons/ci";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";


export default function QuestionList() {
  const [filter, setFilter] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await questionApi.getQuestions(1, 20); 
        setQuestions(res.questions);
      } catch (err) {
        console.error('Lỗi load questions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const handleLike = async (id: string) => {
    try {
      await questionApi.likeQuestion(id);
      const res = await questionApi.getQuestionById(id);
      setQuestions((prev) =>
        prev.map((q) => (q._id === id ? res : q))
      );
    } catch (err) {
      console.error('Lỗi like câu hỏi', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    try {
      await questionApi.deleteQuestion(id); 
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error('Lỗi xóa câu hỏi', err);
    }
  };
  const filteredQuestions = questions.filter((q) => {
    if (filter === 'answered') return q.totalAnswers > 0;
    if (filter === 'unanswered') return q.totalAnswers === 0;
    return true;
  });

  if (loading) {
    return <p className="p-6 text-gray-500">Đang tải câu hỏi...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
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
      <div className="space-y-12">
        {filteredQuestions.map((q) => (
          <div
            key={q._id}
            className="p-8 rounded-xl shadow-md hover:shadow-lg transition bg-white"
          >
            <div className="flex items-start gap-3 mb-3">
              <Image
                src={q.author?.avatar || '/images/default.jpg'}
                alt={q.author?.firstName}
                width={42}
                height={42}
                className="rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-sm">
                  {q.author?.firstName} {q.author?.lastName}
                </h4>
                <p className="text-xs text-gray-500">
                  {new Date(q.createdAt).toLocaleDateString()}
                </p>
              </div>
                {q.author?._id === currentUserId && (
                  <div className="ml-auto relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === q._id ? null : q._id)}
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <CiMenuKebab size={18} />
                    </button>
                      {menuOpen === q._id && (
                        <div className="absolute right-0 mt-2 w-36 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              setEditing(q);
                              setMenuOpen(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100"
                          >
                            <FaRegEdit size={18} />
                            <span>Sửa</span>
                          </button>

                          <button
                            onClick={() => {
                              handleDelete(q._id);
                              setMenuOpen(null);
                            }}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100"
                          >
                            <MdOutlineDeleteOutline size={20} />
                            <span>Xóa</span>
                          </button>
                        </div>
                      )}
                  </div>
                )}
            </div>
            <Link href={`/user/question/${q._id}`}>
              <h3 className="font-medium text-gray-900 text-base mb-2 hover:underline">
                {q.title}
              </h3>
            </Link>

            <div className="flex items-center gap-8 text-sm text-gray-600 mt-4">
              <button
                onClick={() => handleLike(q._id)}
                className="flex items-center gap-1 hover:text-blue-600"
              >
                <BiLike /> {q.totalLikes || 0}
              </button>
              <Link
                href={`/user/question/${q._id}`}
                className="flex items-center gap-1 text-red-500 font-medium hover:underline"
              >
                <FaRegCommentAlt /> {q.totalAnswers || 0} trả lời
              </Link>
            </div>
          </div>
        ))}
      </div>
      <EditQuestionModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        question={editing}
        onSuccess={(updated) => {
          setQuestions((prev) =>
            prev.map((q) => (q._id === updated._id ? updated : q))
          );
        }}
      />
    </div>
  );
}
