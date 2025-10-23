'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface NoticeAction {
  label: string;
  onClick?: () => void;
}

interface NoticeProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  title: string;
  message: string;
  actions?: NoticeAction[];
}

const Notice: React.FC<NoticeProps> = ({
  open,
  setOpen,
  title,
  message,
  actions = [],
}) => {
  const closeNotice = () => setOpen(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const renderButtons = () => {
    if (actions.length === 0) {
      return (
        <Button variant="primary" className="flex items-center gap-2 rounded-xl" onClick={closeNotice}>
          Đóng
        </Button>
      );
    }

    if (actions.length === 1) {
      const a = actions[0];
      return (
        <Button variant="primary" className="flex items-center gap-2 rounded-xl" onClick={a.onClick || closeNotice}>
          {a.label}
        </Button>
      );
    }

    if (actions.length === 2) {
      const [left, right] = actions;
      return (
        <div className="flex justify-center gap-3">
          <Button
            variant="outline-primary"
            className="flex items-center gap-2 rounded-xl"
            onClick={left.onClick || closeNotice}
          >
            {left.label}
          </Button>
          <Button
            variant="primary"
            className="flex items-center gap-2 rounded-xl"
            onClick={right.onClick || closeNotice}
          >
            {right.label}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex justify-center gap-3 flex-wrap">
        {actions.map((a, i) => (
          <Button key={i} className="flex items-center gap-2 rounded-xl" variant="primary" onClick={a.onClick || closeNotice}>
            {a.label}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative bg-white rounded-2xl shadow-xl w-[90%] max-w-md pt-13 pb-10 px-6 text-center"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 30 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <motion.div
              className="absolute -top-18 left-1/2 -translate-x-1/2 w-40 h-40"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <img
                src="/notice.svg"
                alt="notice"
                className="w-full h-full object-contain"
              />
            </motion.div>

            {/* Tiêu đề & nội dung */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold text-gray-700 mb-2">{title}</h2>
              <p className="text-gray-500 mb-5">{message}</p>
            </div>

            {/* Nút hành động */}
            {renderButtons()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notice;
