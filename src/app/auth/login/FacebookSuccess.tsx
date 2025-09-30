// src/app/auth/login/FacebookSuccess.tsx
"use client";

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/store/slices/authSlice';
import useUser from '@/hooks/useUser';

const FacebookLoginHandler = () => {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const { refetch } = useUser();

  useEffect(() => {
    console.log("FacebookSuccess.tsx: Component mounted. Checking for tokens in URL...");
    console.log("FacebookSuccess.tsx: Full URL search params:", searchParams.toString());

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    console.log("FacebookSuccess.tsx: Extracted accessToken:", accessToken);
    console.log("FacebookSuccess.tsx: Extracted refreshToken:", refreshToken);

    if (accessToken) {
      console.log("FacebookSuccess.tsx: accessToken found. Storing in localStorage...");
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      console.log("FacebookSuccess.tsx: Tokens stored. Refetching user data...");

      dispatch(login({ token: accessToken }));

      refetch().then(() => {
        console.log("FacebookSuccess.tsx: User data refetched. Redirecting to home page...");
        router.push('/');
      });

    } else {
      console.log("FacebookSuccess.tsx: accessToken NOT found in URL. Redirecting to login page.");
      router.push('/auth/login');
    }
  }, [searchParams, dispatch, router, refetch]);

  return <div>Đang xử lý đăng nhập với Facebook... Vui lòng kiểm tra console (F12).</div>;
};

const FacebookSuccessPage = () => {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <FacebookLoginHandler />
    </Suspense>
  );
};

export default FacebookSuccessPage;