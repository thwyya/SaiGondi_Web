"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { authApi } from "@/lib/auth/authApi";
import { AxiosError } from "axios";
import { FiChevronLeft } from "react-icons/fi";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [resendStatus, setResendStatus] = useState('');

  const handleResendOTP = async () => {
    if (!email) {
      setApiError("Không tìm thấy email. Vui lòng thử lại.");
      return;
    }
    setResendStatus('Đang gửi...');
    try {
      await authApi.sendEmailOTP(email, 'verify');
      setResendStatus('Mã OTP mới đã được gửi!');
    } catch (error) {
      setResendStatus('Gửi lại mã thất bại.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!otp.trim()) newErrors.otp = "Vui lòng nhập mã xác thực";
    if (!email) {
      setApiError("Không tìm thấy email. Vui lòng thử lại.");
      return;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setApiError("");

    try {
      await authApi.verifyOTP(email, otp);
      router.push("/auth/login");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      setApiError(err.response?.data?.message || "Xác thực thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side */}
      <div className="w-1/2 flex flex-col justify-center px-16 bg-gradient-to-b from-[#fdfdfd] to-[#f1f5ff]">
        {/* Back to login */}
        <button
          onClick={() => router.push("/auth/login")}
          className="flex items-center gap-2 text-gray-600 text-sm mb-6"
        >
          <FiChevronLeft /> Quay lại trang đăng nhập
        </button>

        {/* Logo */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#307afd] flex items-center gap-2">
            <span className="text-3xl">🦶</span> SÀI GÒN ĐI
          </h1>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#307afd] mb-2">MÃ XÁC THỰC</h2>
        <p className="text-gray-600 text-sm mb-5">
          Mã xác thực đã được gửi tới email của bạn.
        </p>

        {/* Error */}
        {apiError && (
          <p className="text-red-500 text-sm mb-3">{apiError}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Mã xác thực"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className={errors.otp ? "input-error" : ""}
          />
          {errors.otp && (
            <p className="text-red-500 text-sm">{errors.otp}</p>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="text-sm text-[#307afd] underline"
              onClick={handleResendOTP}
            >
              Gửi lại mã!
            </button>
            {resendStatus && <p className="text-sm text-gray-600">{resendStatus}</p>}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Đang xác thực..." : "XÁC THỰC"}
          </Button>
        </form>
      </div>

      {/* Right side - Image */}
      <div className="w-1/2 flex items-center justify-center bg-gray-50">
        <img
          src="/images/hcmc.png"
          alt="Sài Gòn"
          className="rounded-3xl w-[80%] object-cover shadow-lg"
        />
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
