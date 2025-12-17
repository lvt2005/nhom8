import Link from "next/link";
import { Login } from "./formlogin";
import { Toaster } from "sonner";
import { Sonner } from "../../../../helper/sonner";
export default function Home() {
  return (
    <>
      <Toaster richColors closeButton position="top-right" />
      <Sonner />
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Đăng Nhập</h1>
            <p>Chào mừng bạn trở lại!</p>
          </div>

          <Login />

          <div className="auth-footer">
            <p>
              Chưa có tài khoản?{' '}
              <Link href={"/register"} className="auth-link">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
