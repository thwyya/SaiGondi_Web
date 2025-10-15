'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { questionApi } from '@/lib/question/questionApi';

interface QuestionFormProps {
  onSuccess?: (question: any) => void;
}

export default function QuestionForm({ onSuccess }: QuestionFormProps) {
  const [title, setTitle] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (!title.trim() || title.trim().length < 10) {
      alert('Tiêu đề phải có ít nhất 10 ký tự');
      return;
    }

    try {
      const newQuestion = await questionApi.createQuestion({
        title: title.trim(),
      });

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(newQuestion);
      }

      setTitle('');
      router.push('/user/question');
    } catch (error) {
      console.error('Tạo câu hỏi thất bại', error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Đặt câu hỏi</h2>
        <textarea
            placeholder="Nhập nội dung câu hỏi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:border-gray-400"
            rows={5}
        />
        <div className="flex justify-end">
            <Button variant="primary" onClick={handleSubmit}>
            Đăng câu hỏi
            </Button>
        </div>
        </div>
    </div>
    );
}