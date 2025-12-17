import Link from "next/link";

export default function ResetPaword() {
  return (
    <>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Đặt Lại Mật Khẩu</h1>
            <p>Nhập mật khẩu mới của bạn</p>
          </div>

          <form className="auth-form">
            <div className="form-group">
              <label htmlFor="password">Mật Khẩu Mới</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  placeholder="Nhập mật khẩu mới"
                />
                <button
                  type="button"
                  className="password-toggle"
                >
                </button>
              </div>
              <div className="password-hint">
                Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                />
                <button
                  type="button"
                  className="password-toggle"
                >
                </button>
              </div>
            </div>

            <button type="submit" className="auth-button">
              Đặt Lại Mật Khẩu
            </button>
          </form>

          <div className="auth-footer">
            <p>
              <Link href={''} className="auth-link">
                Quay lại đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}