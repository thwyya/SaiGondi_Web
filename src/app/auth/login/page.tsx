// src/app/auth/login/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "@/store/slices/authSlice";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FaFacebookF, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import SimpleOAuthButton from "@/components/SimpleOAuthButton";
import { authApi } from "@/lib/auth/authApi";
import { AxiosError } from "axios";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("remember_email");
    const rememberedPassword = localStorage.getItem("remember_password");
    if (rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.login(email, password);
      console.log("Đăng nhập thành công:", res);

      dispatch(
        login({
          user: res.user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
        }),
      );

      if (rememberMe) {
        localStorage.setItem("remember_email", email);
        localStorage.setItem("remember_password", password);
      } else {
        localStorage.removeItem("remember_email");
        localStorage.removeItem("remember_password");
      }

      router.push("/");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      setApiError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="heading-2 font-bold text-[var(--secondary)] mb-1">ĐĂNG NHẬP</h2>
      <p className="text-sm text-gray-600 mb-5">Đăng nhập tài khoản của bạn</p>

      {apiError && <p className="text-[var(--warning)] text-sm mb-2">{apiError}</p>}

      <form onSubmit={handleSubmit} className="space-y-5 pt-5">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            label="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm flex-wrap gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]" />
            <span className="ml-2 text-sm text-gray-900">Ghi nhớ mật khẩu</span>
          </label>

          <a
            href="/auth/forgot-password"
            className="text-[var(--primary)] hover:underline whitespace-nowrap"
          >
            Quên mật khẩu?
          </a>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-4" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
        </Button>
      </form>

      <p className="text-sm mt-6 text-gray-600">
        Bạn chưa có tài khoản? <a href="/auth/register" className="text-[var(--primary)] hover:underline">Đăng ký ngay</a>
      </p>

      <div className="flex items-center gap-2 py-2">
        <hr className="flex-1 border-gray-300" />
        <span className="text-gray-500 text-sm">Hoặc đăng nhập bằng</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      <div className="flex justify-center mt-8 space-x-4">
        <SimpleOAuthButton provider="facebook">
          <FaFacebookF className="text-[var(--primary)] text-xl" />
        </SimpleOAuthButton>
        <SimpleOAuthButton provider="google">
          <FcGoogle className="text-xl" />
        </SimpleOAuthButton>
        <Button variant="outline-primary"><FaApple className="text-black text-xl" /></Button>
      </div>
      
      <div className="text-center mt-4">
        <a href="/auth/debug" className="text-sm text-blue-600 hover:underline">
          Debug OAuth Issues
        </a>
      </div>
    </>
  );
}
