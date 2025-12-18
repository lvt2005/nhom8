"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function OTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("resetEmail");
    if (!savedEmail) {
      router.push("/forgotPassword");
      return;
    }
    setEmail(savedEmail);
  }, [router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/password/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.code === "success") {
        setCountdown(60);
        setError("");
      } else {
        setError(data.Message);
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Vui lòng nhập đủ 6 số");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/password/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });
      const data = await res.json();
      if (data.code === "success") {
        sessionStorage.setItem("resetOTP", otpValue);
        router.push("/resetPassword");
      } else {
        setError(data.Message || "Mã OTP không đúng");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Xác Thực OTP</h1>
            <p>Nhập mã 6 chữ số đã gửi đến {email}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="flex justify-center gap-2 mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
                  disabled={loading}
                />
              ))}
            </div>

            {error && <p className="text-red-500 text-sm text-center mb-2">{error}</p>}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Đang xác thực..." : "Xác Thực"}
            </button>

            <div className="text-center mt-4">
              {countdown > 0 ? (
                <p className="text-gray-500 text-sm">Gửi lại sau {countdown}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-purple-600 hover:underline text-sm"
                >
                  {resending ? "Đang gửi..." : "Gửi lại mã"}
                </button>
              )}
            </div>
          </form>

          <div className="auth-footer">
            <p>
              <Link href="/forgotPassword" className="auth-link">
                Quay lại
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}