"use client"
import Link from "next/link"
import { useEffect, useState } from "react";
import JustValidate from 'just-validate';
import { toast, Toaster } from 'sonner';
import { useRouter } from "next/navigation";
export const Login = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [Remember, setRemember] = useState<boolean>(false)
  useEffect(() => {
    const validator = new JustValidate('#formLogin');
    validator
      .addField('#email', [
        {
          rule: 'required',
          errorMessage: "Vui lòng nhập email!"
        },
        {
          rule: 'email',
          errorMessage: "Email có định dạng không hợp lệ!",
        },
      ])
      .addField('#password', [
        {
          rule: 'required',
          errorMessage: "Vui lòng nhập mật khẩu!",
        },
      ])
      .onSuccess((event: any) => {
        event.preventDefault()
        const email = event.target.email.value
        const password = event.target.password.value
        const remember = Remember
        const dataFinal = {
          email: email,
          password: password,
          remember:remember
        }
        if (isSubmitting) return;   // ⛔ chặn gửi nhiều lần
        setIsSubmitting(true);      // 🔒 khoá nút
        fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/login`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(dataFinal)
        })
          .then(res => res.json())
          .then(data => {
            if (data.code == "error") {
              toast.error(data.Message)
              setIsSubmitting(false); // ❗Mở lại nút khi lỗi
            }
            if (data.code == "success") {
              router.push("/chat")
              sessionStorage.setItem("code", data.code)
              sessionStorage.setItem("message", data.Message)
            }
          })
          .catch(() => setIsSubmitting(false)); // luôn mở lại nếu lỗi mạng
      });
  }, [])
  const handleChange = (e: any)=>{
    const value = e.target.checked
    setRemember(value)
  }
  return (
    <>
      <Toaster richColors closeButton position="top-right" />
      <form className="auth-form" id="formLogin">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Nhập email của bạn"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Nhập mật khẩu"
          />
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input type="checkbox" onChange={handleChange} />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <Link href={"/forgotPassword"} className="forgot-link">
            Quên mật khẩu?
          </Link>
        </div>

        <button type="submit" className="auth-button">
          Đăng Nhập
        </button>
      </form>
    </>
  )
}