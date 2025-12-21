"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/password/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.code === "success") {
        setSuccess(true);
        sessionStorage.setItem("resetEmail", email);
        setTimeout(() => router.push("/OTP"), 1500);
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
            <h1>Quên Mật Khẩu</h1>
            <p>Nhập email để nhận mã OTP khôi phục mật khẩu</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">Đã gửi mã OTP! Đang chuyển hướng...</p>}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi Mã OTP"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Nhớ lại mật khẩu?{' '}
              <Link href={"/"} className="auth-link">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}