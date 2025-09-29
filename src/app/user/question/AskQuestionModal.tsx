'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { questionApi } from '@/lib/question/questionApi';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (question: any) => void;
}

export default function AskQuestionModal({
  isOpen,
  onClose,
  onSuccess
}: AskQuestionModalProps) {
  const [title, setTitle] = useState('');
  const router = useRouter();

  if (!isOpen) return null;

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
      onClose();
      if (typeof onSuccess === 'function') {
        onSuccess(newQuestion);
      }
      setTitle('');
    } catch (error) {
      console.error('Tạo câu hỏi thất bại', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">Đặt câu hỏi</h2>
        <textarea
          placeholder="Nhập nội dung câu hỏi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:border-gray-400"
          rows={5}
        />
        <div className="flex justify-end gap-3">
          <Button variant="outline-primary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Đăng câu hỏi
          </Button>
        </div>
      </div>
    </div>
  );
}
