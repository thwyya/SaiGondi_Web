// src/app/auth/login/page.tsx (Admin)
"use client";
import React, { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch } from 'react-redux';
import { useSearchParams, useRouter } from "next/navigation";
import { login as loginAction } from '@/app/admin/store/authSlice';
import { BASE_URL } from "../utils/config";
import api from "@/services/api";
import { toast } from "sonner";

export default function LoginPage() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [stats, setStats] = useState({ users: 0, places: 0, blogs: 0, views: 0 });



  useEffect(() => {
    const prefillEmail = searchParams.get('email');
    if (prefillEmail) setEmail(prefillEmail);

    const rememberedEmail = localStorage.getItem("admin_remember_email");
    const rememberedPassword = localStorage.getItem("admin_remember_password");
    if (rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }

    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      api
        .get("/admin/stats/overview")
        .then((res) => setStats(res.data?.data || {}))
        .catch((err) => console.log("Lỗi lấy thống kê:", err));
    }
  }, [searchParams]);


  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email || !password) {
      return toast.error('Vui lòng nhập đầy đủ thông tin');
    }

    try {
      const res = await api.post(`${BASE_URL}/users/login`, { email, password });
      const { accessToken, refreshToken, user } = res.data;

      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }

      if (user.role !== 'admin') {
        toast.error('Bạn không có quyền truy cập admin');
        return;
      }

      if (rememberMe) {
        localStorage.setItem("admin_remember_email", email);
        localStorage.setItem("admin_remember_password", password);
      } else {
        localStorage.removeItem("admin_remember_email");
        localStorage.removeItem("admin_remember_password");
      }

      dispatch(loginAction({ user, accessToken, refreshToken }));
      toast.success('Đăng nhập thành công');
      router.push('/admin/dashboard');
    } catch (err) {
      toast.error('Đăng nhập thất bại');
      console.error(err);
    }
  };

  return (
    <>
      <h2 className="heading-2 font-bold text-[var(--secondary)] mb-1">ĐĂNG NHẬP QUẢN TRỊ VIÊN</h2>
      <p className="text-sm text-gray-600 mb-5">Đăng nhập tài khoản Admin</p>

      <form onSubmit={handleLogin} className="space-y-5 pt-5">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            label="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
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
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="sr-only peer"
            />
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

        <Button type="submit" variant="primary" className="w-full mt-4">
          ĐĂNG NHẬP
        </Button>
      </form>
    </>
  );
}
