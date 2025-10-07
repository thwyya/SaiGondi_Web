// src/app/auth/login/GoogleSuccess.tsx
"use client";

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/store/slices/authSlice';


const GoogleLoginHandler = () => {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const refetch = async () => { 
    // Giả sử hàm này sẽ gọi API để lấy thông tin user mới nhất
    console.log("Refetching user data...");
    return Promise.resolve();
  }


  useEffect(() => {
    console.log("GoogleSuccess.tsx: Component mounted. Checking for tokens in URL...");
    console.log("GoogleSuccess.tsx: Full URL search params:", searchParams.toString());

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    console.log("GoogleSuccess.tsx: Extracted accessToken:", accessToken);
    console.log("GoogleSuccess.tsx: Extracted refreshToken:", refreshToken);

    if (accessToken) {
      console.log("GoogleSuccess.tsx: accessToken found. Storing in localStorage...");
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      console.log("GoogleSuccess.tsx: Tokens stored. Refetching user data...");

      dispatch(login({ token: accessToken }));

      refetch().then(() => {
        console.log("GoogleSuccess.tsx: User data refetched. Redirecting to home page...");
        router.push('/');
      });

    } else {
      console.log("GoogleSuccess.tsx: accessToken NOT found in URL. Redirecting to login page.");
      router.push('/auth/login');
    }
  }, [searchParams, dispatch, router]);

  return <div>Đang xử lý đăng nhập với Google... Vui lòng kiểm tra console (F12).</div>;
};

const GoogleSuccessPage = () => {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <GoogleLoginHandler />
    </Suspense>
  );
};

export default GoogleSuccessPage;