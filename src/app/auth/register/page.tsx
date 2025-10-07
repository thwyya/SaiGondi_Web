// src/app/auth/register/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FaFacebookF, FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { authApi } from "@/lib/auth/authApi";
import { AxiosError } from "axios";
export default function RegisterPage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) newErrors.firstName = "Vui lòng nhập họ và tên lót";
    if (!lastName.trim()) newErrors.lastName = "Vui lòng nhập tên";
    if (!email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!password.trim()) newErrors.password = "Vui lòng nhập mật khẩu";
    if (password !== confirmPassword) newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setApiError("");

    try {
      await authApi.register(
        lastName,
        firstName,
        email,
        password,
        confirmPassword
      );

      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      setApiError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="heading-2 font-bold text-[var(--secondary)] mb-1">
        ĐĂNG KÝ
      </h2>
      <p className="text-sm text-gray-600 mb-5">
        Hãy bắt đầu tạo tài khoản cho bản thân
      </p>

      {apiError && (
        <p className="text-[var(--warning)] text-sm mb-3">{apiError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 pt-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              label="Họ và tên lót"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className={errors.lastName ? "input-error" : ""}
            />
            {errors.lastName && (
              <p className="text-[var(--warning)] text-sm">
                {errors.lastName}
              </p>
            )}
          </div>
          <div>
            <Input
              type="text"
              label="Tên"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={errors.firstName ? "input-error" : ""}
            />
            {errors.firstName && (
              <p className="text-[var(--warning)] text-sm">
                {errors.firstName}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && (
              <p className="text-[var(--warning)] text-sm">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            label="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={errors.password ? "input-error" : ""}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
          {errors.password && (
            <p className="text-[var(--warning)] text-sm">{errors.password}</p>
          )}
        </div>

        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            label="Xác thực mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={errors.confirmPassword ? "input-error" : ""}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
          {errors.confirmPassword && (
            <p className="text-[var(--error)] text-sm">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="terms"
            checked={agree}
            onChange={() => setAgree(!agree)}
            className="w-4 h-4 rounded border-gray-300"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            Tôi đã đọc các điều khoản và điều kiện
          </label>
        </div>

        <Button type="submit" variant="primary" className="w-full mt-4" disabled={loading}>
          {loading ? "Đang đăng ký..." : "ĐĂNG KÝ"}
        </Button>
      </form>

      <p className="text-sm mt-6 text-gray-600 text-center">
        Bạn đã có tài khoản? <a href="/auth/login" className="text-[var(--primary)] hover:underline">Đăng nhập ngay</a>
      </p>

      <div className="flex items-center gap-2 pt-5">
        <hr className="flex-1 border-gray-300" />
        <span className="text-gray-500 text-sm">Hoặc đăng ký bằng</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      <div className="flex justify-center mt-8 space-x-4">
        <Button variant="outline-primary"><FaFacebookF className="text-[var(--primary)] text-xl" /></Button>
        <Button variant="outline-primary"><FcGoogle className="text-xl" /></Button>
        <Button variant="outline-primary"><FaApple className="text-black text-xl" /></Button>
      </div>
    </>
  );
}
