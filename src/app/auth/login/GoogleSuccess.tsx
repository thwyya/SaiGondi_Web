// src/app/auth/login/GoogleSuccess.tsx
"use client";

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/store/slices/authSlice';

const GoogleSuccess = () => {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      // Giả sử action `login` của bạn có thể xử lý chỉ với accessToken
      dispatch(login({ token: accessToken }));
      router.push('/');
    } else {
      router.push('/auth/login');
    }
  }, [searchParams, dispatch, router]);

  return <div>Đang đăng nhập với Google...</div>;
};

export default GoogleSuccess;