import Link from "next/link";
import { FormRegister } from "./formRegister";


export default function Register() {
  return (
    <>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Đăng Ký</h1>
            <p>Tạo tài khoản mới của bạn</p>
          </div>

          <FormRegister/>

          <div className="auth-footer">
            <p>
              Đã có tài khoản?{' '}
              <Link href={"/"} className="auth-link">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}