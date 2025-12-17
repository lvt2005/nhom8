import Link from "next/link";

export default function ForgotPassword() {
  return (
    <>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Quên Mật Khẩu</h1>
            <p>Nhập email để nhận mã OTP khôi phục mật khẩu</p>
          </div>

          <form  className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Nhập email của bạn"
              />
            </div>

            <button type="submit" className="auth-button">
              Gửi Mã OTP
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Nhớ lại mật khẩu?{' '}
              <Link href={""} className="auth-link">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}