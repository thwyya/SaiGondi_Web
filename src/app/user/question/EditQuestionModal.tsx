'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { questionApi } from '@/lib/question/questionApi';

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: any;
  onSuccess: (updated: any) => void;
}

export default function EditQuestionModal({
  isOpen,
  onClose,
  question,
  onSuccess
}: EditQuestionModalProps) {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (question) setTitle(question.title);
  }, [question]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim() || title.trim().length < 10) {
      alert('Tiêu đề phải có ít nhất 10 ký tự');
      return;
    }
    try {
      const updated = await questionApi.updateQuestion(question._id, { title });
      onSuccess(updated);
      onClose();
    } catch (error) {
      console.error('Cập nhật câu hỏi thất bại', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">Sửa câu hỏi</h2>
        <textarea
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
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}
