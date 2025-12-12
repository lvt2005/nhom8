"use client"
import { useEffect, useState } from "react"
import JustValidate from 'just-validate';
import { toast, Toaster } from 'sonner';
import { useRouter } from "next/navigation";
export const FormRegister = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  useEffect(() => {
    const validator = new JustValidate('#formRegister');
    validator
      .addField('#fullName', [
        {
          rule: 'required',
          errorMessage: 'Vui lòng nhập Họ và Tên',
        },
        {
          rule: 'minLength',
          value: 5,
          errorMessage: 'Vui lòng nhập đủ 5 kí tự',
        },
        {
          rule: 'maxLength',
          value: 50,
          errorMessage: 'Vui lòng không nhập quá 50 kí tự',
        },
      ])
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
      .addField('#phone', [
        {
          rule: 'required',
          errorMessage: 'Vui lòng nhập số điện thoại',
        },
        {
          rule: 'customRegexp',
          value: /^0(3|5|7|8|9)\d{8}$/,
          errorMessage: "Số điện thoại không đúng định dạng!",
        },
      ])
      .addField('#password', [
        {
          rule: 'required',
          errorMessage: "Vui lòng nhập mật khẩu!",
        },
        {
          rule: "minLength",
          value: 8,
          errorMessage: "Vui lòng nhập đủ 8 kí tự!",
        },
        {
          rule: "customRegexp",
          value: /[A-Z]/,
          errorMessage: "Vui lòng nhập ít nhất một chữ cái viết hoa!",
        },
        {
          rule: "customRegexp",
          value: /[a-z]/,
          errorMessage: "Vui lòng nhập ít nhất một chữ cái viết thường!",
        },
        {
          rule: "customRegexp",
          value: /\d/,
          errorMessage: "Vui lòng nhập ít nhất một số!",
        },
        {
          rule: "customRegexp",
          value: /[!@#$%^&*()_+\-={}[\]|\\:;"'<>,.?~`]/,
          errorMessage: "Vui lòng nhập ít nhất một kí tự đặc biệt! ví dụ: !@#$%^&*",
        },
      ])
      .addField('#confirmPassword', [
        {
          rule: 'required',
          errorMessage: 'Vui lòng nhập lại mật khẩu',
        },
        {
          validator: (value: any, field: any) => {
            const password = field["#password"].elem.value
            return value == password
          },
          errorMessage: "Mật khẩu xác thực không khớp",
        }
      ])
      .onSuccess((event: any) => {
        event.preventDefault()
        const fullName = event.target.fullName.value
        const email = event.target.email.value
        const phone = event.target.phone.value
        const password = event.target.password.value
        const dataFinal = {
          fullName: fullName,
          email: email,
          phone: phone,
          password: password,
        }
        if (isSubmitting) return;   // ⛔ chặn gửi nhiều lần
        setIsSubmitting(true);      // 🔒 khoá nút
        fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/register`, {
          method: "POST",
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
              router.push("/")
              sessionStorage.setItem("code", data.code)
              sessionStorage.setItem("message", data.Message)
            }
          })
          .catch(() => setIsSubmitting(false)); // luôn mở lại nếu lỗi mạng
      });
  }, [])
  return (
    <>
      <Toaster richColors closeButton position="top-right" />
      <form className="auth-form" id="formRegister">
        <div className="form-group">
          <label htmlFor="fullName">Họ và Tên</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Nhập họ tên của bạn"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Nhập email của bạn"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Số Điện Thoại</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Nhập số điện thoại"
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

        <div className="form-group">
          <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
          />
        </div>

        <button type="submit" className="auth-button">
          Đăng Ký
        </button>
      </form>
    </>
  )
}