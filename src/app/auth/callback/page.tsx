"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { authApi } from "@/lib/auth/authApi"; // Assuming path is correct
import { login } from "@/store/slices/authSlice"; // Using the correct action 'login'

function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleAuth = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");

      if (accessToken && refreshToken) {
        try {
          // Save tokens to localStorage
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);

          // 1. Fetch user profile using the new token
          const userProfile = await authApi.getProfile(accessToken);

          if (userProfile) {
            // 2. Dispatch the 'login' action with the correct payload
            dispatch(login({ 
              user: userProfile, 
              accessToken: accessToken, 
              refreshToken: refreshToken 
            }));
          } else {
            // Handle case where token is valid but profile fetch fails
            throw new Error("User profile could not be fetched.");
          }

          // 3. Redirect to home page
          router.push("/");

        } catch (error: any) {
          console.error("--- AUTH CALLBACK FAILED ---");
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Response Data:", error.response.data);
            console.error("Response Status:", error.response.status);
            console.error("Response Headers:", error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            console.error("Request Data:", error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error Message:", error.message);
          }
          console.error("Full Error Object:", error);
          // If anything fails, redirect to login
          router.push("/auth/login");
        }
      } else {
        // No tokens found in URL, redirect to login
        console.error("No tokens found in URL");
        router.push("/auth/login");
      }
    };

    handleAuth();
  }, [searchParams, router, dispatch]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Đang hoàn tất đăng nhập...</p>
    </div>
  );
}

// Wrap with Suspense because useSearchParams should be used in a Suspense boundary
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthCallback />
    </Suspense>
  );
}
