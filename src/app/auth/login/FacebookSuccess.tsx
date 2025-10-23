// src/app/auth/login/FacebookSuccess.tsx
"use client";

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/store/slices/authSlice';
import { userApi } from '@/lib/user/userApi';


const FacebookLoginHandler = () => {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const handleLogin = async () => {
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
        console.log("FacebookSuccess.tsx: Tokens stored. Fetching user data...");

        try {
          const user = await userApi.getMe();
          dispatch(login({ user, accessToken, refreshToken }));
          console.log("FacebookSuccess.tsx: User data fetched and login dispatched. Redirecting to home page...");
          router.push('/');
        } catch (error) {
          console.error("FacebookSuccess.tsx: Failed to fetch user data.", error);
          router.push('/auth/login');
        }
      } else {
        console.log("FacebookSuccess.tsx: accessToken NOT found in URL. Redirecting to login page.");
        router.push('/auth/login');
      }
    };

    handleLogin();
  }, [searchParams, dispatch, router]);

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