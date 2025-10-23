"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { login } from '@/store/slices/authSlice';
import { userApi } from '@/lib/user/userApi';

interface OAuthHandlerProps {
  provider: 'google' | 'facebook';
}

const OAuthHandler: React.FC<OAuthHandlerProps> = ({ provider }) => {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log(`${provider} OAuth Handler: Component mounted. Checking for tokens in URL...`);
      console.log(`${provider} OAuth Handler: Full URL search params:`, searchParams.toString());

      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      console.log(`${provider} OAuth Handler: Extracted accessToken:`, accessToken);
      console.log(`${provider} OAuth Handler: Extracted refreshToken:`, refreshToken);
      console.log(`${provider} OAuth Handler: Extracted error:`, error);

      // Check for OAuth errors first
      if (error) {
        console.error(`${provider} OAuth Handler: OAuth error received:`, error, errorDescription);
        setStatus('error');
        setErrorMessage(errorDescription || error);
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
        return;
      }

      if (accessToken) {
        console.log(`${provider} OAuth Handler: accessToken found. Storing in localStorage...`);
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        console.log(`${provider} OAuth Handler: Tokens stored. Fetching user data...`);

        try {
          const user = await userApi.getMe();
          dispatch(login({ user, accessToken, refreshToken: refreshToken || null }));
          console.log(`${provider} OAuth Handler: User data fetched and login dispatched. Redirecting to home page...`);
          setStatus('success');
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } catch (error) {
          console.error(`${provider} OAuth Handler: Failed to fetch user data.`, error);
          setStatus('error');
          setErrorMessage('Không thể lấy thông tin người dùng');
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        }
      } else {
        console.log(`${provider} OAuth Handler: accessToken NOT found in URL. Redirecting to login page.`);
        setStatus('error');
        setErrorMessage('Không nhận được token từ nhà cung cấp OAuth');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, dispatch, router, provider]);

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return `Đang xử lý đăng nhập ${provider === 'google' ? 'Google' : 'Facebook'}...`;
      case 'success':
        return 'Đăng nhập thành công! Đang chuyển hướng...';
      case 'error':
        return `Lỗi: ${errorMessage}`;
      default:
        return 'Đang xử lý...';
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      gap: '20px'
    }}>
      <div style={{
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: status === 'error' ? '#fee' : status === 'success' ? '#efe' : '#f0f0f0',
        border: `1px solid ${status === 'error' ? '#fcc' : status === 'success' ? '#cfc' : '#ccc'}`,
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <p>{getStatusMessage()}</p>
        {status === 'loading' && (
          <div style={{ marginTop: '10px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #ccc',
              borderTop: '2px solid #007bff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OAuthHandler;
