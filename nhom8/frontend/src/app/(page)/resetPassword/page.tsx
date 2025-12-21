"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const router = useRouter();

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("resetEmail");
    const savedOTP = sessionStorage.getItem("resetOTP");
    if (!savedEmail || !savedOTP) {
      router.push("/forgotPassword");
      return;
    }
    setEmail(savedEmail);
    setOtp(savedOTP);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/password/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });
      const data = await res.json();
      if (data.code === "success") {
        setSuccess(true);
        sessionStorage.removeItem("resetEmail");
        sessionStorage.removeItem("resetOTP");
        setTimeout(() => router.push("/"), 2000);
      } else {
        setError(data.Message || "Có lỗi xảy ra");
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
            <h1>Đặt Lại Mật Khẩu</h1>
            <p>Nhập mật khẩu mới của bạn</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">Mật Khẩu Mới</label>
              <div className="password-input-wrapper relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Nhập mật khẩu mới"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </button>
              </div>
              <div className="password-hint text-xs text-gray-500 mt-1">
                Mật khẩu phải có ít nhất 8 ký tự
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</label>
              <div className="password-input-wrapper relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">Đổi mật khẩu thành công! Đang chuyển hướng...</p>}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              <Link href="/" className="auth-link">
                Quay lại đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}