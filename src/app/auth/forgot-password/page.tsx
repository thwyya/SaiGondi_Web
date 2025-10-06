"use client";

import React, { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FiEye, FiEyeOff, FiChevronLeft } from "react-icons/fi";
import { sendPasswordResetOTP, resetPassword } from "@/services/userService";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (step === 1) {
      try {
        await sendPasswordResetOTP(email);
        setStep(2);
      } catch (err) {
        setError("Failed to send OTP. Please check your email and try again.");
      }
    } else if (step === 2) {
      // The backend doesn't have a separate OTP verification step.
      // It verifies the OTP during password reset.
      setStep(3);
    } else if (step === 3) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }
      try {
        await resetPassword(email, code, password);
        router.push("/auth/login");
      } catch (err) {
        setError("Failed to reset password. Please check your OTP and try again.");
      }
    }
    setLoading(false);
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetOTP(email);
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    }
    setLoading(false);
  };

    // gộp 3 bước đổi mật khẩu vào 1 trang (multi-step)
  return (
    <>
      <a
        href="/auth/login"
        className="text-sm text-gray-500 hover:underline inline-flex items-center mb-4"
      >
        <FiChevronLeft className="mr-2 text-base" />
        Quay lại trang đăng nhập
      </a>

    {/* nhập email để lấy lại mật khẩu */}
      {step === 1 && (
        <>
          <h2 className="heading-2 font-bold text-[var(--primary)] mb-1">
            QUÊN MẬT KHẨU
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Đừng lo lắng, điều này xảy ra với tất cả chúng ta. Nhập email của bạn
            bên dưới để lấy lại mật khẩu.
          </p>
        </>
      )}

    {/* nhập mã OTP để xác thực */}
      {step === 2 && (
        <>
          <h2 className="heading-2 font-bold text-[var(--primary)] mb-1">
            MÃ XÁC THỰC
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Mã xác thực đã được gửi tới email của bạn.
          </p>
        </>
      )}
      {step === 3 && (
        <>
          <h2 className="heading-2 font-bold text-[var(--primary)] mb-1">
            ĐỔI MẬT KHẨU
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            Vui lòng đặt mật khẩu mới cho tài khoản của bạn.
          </p>
        </>
      )}

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleNextStep} className="space-y-5 pt-5">
        {step === 1 && (
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        {step === 2 && (
          <>
            <Input
              type="text"
              label="Mã xác thực"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button
              type="button"
              className="text-sm text-[var(--primary)] hover:underline -mt-2"
              onClick={handleResendCode}
              disabled={loading}
            >
              {loading ? "Sending..." : "Gửi lại mã!"}
            </button>
          </>
        )}

    {/* Nhập mật khẩu mới và xác nhận lại mật khẩu mới */}
        {step === 3 && (
          <>
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

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                label="Xác thực mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </>
        )}

        <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
          {loading ? "Loading..." : (step === 1 ? "LẤY LẠI MẬT KHẨU" : (step === 2 ? "XÁC THỰC" : "ĐỔI MẬT KHẨU"))}
        </Button>
      </form>
    </>
  );
}