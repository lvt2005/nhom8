"use client"
import { useEffect, useState, useRef } from "react"
import JustValidate from 'just-validate';
import { toast, Toaster } from 'sonner';
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from 'lucide-react';

type JustValidateFields = Record<string, { elem: HTMLInputElement }>;

export const FormRegister = () => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const isSubmittingRef = useRef(false);
  
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
          validator: (value: string, fields: JustValidateFields) => {
            const password = fields["#password"]?.elem?.value || ""
            return value === password
          },
          errorMessage: "Mật khẩu xác thực không khớp",
        }
      ])
      .onSuccess(async (event: SubmitEvent) => {
        event.preventDefault()
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);
        
        const form = event.target as HTMLFormElement
        const fullName = (form.elements.namedItem("fullName") as HTMLInputElement | null)?.value || ""
        const email = (form.elements.namedItem("email") as HTMLInputElement | null)?.value || ""
        const phone = (form.elements.namedItem("phone") as HTMLInputElement | null)?.value || ""
        const password = (form.elements.namedItem("password") as HTMLInputElement | null)?.value || ""
        const dataFinal = {
          fullName: fullName,
          email: email,
          phone: phone,
          password: password,
        }
        
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(dataFinal)
          });
          const data = await res.json();
          if (data.code === "error") {
            toast.error(data.Message);
            isSubmittingRef.current = false;
            setIsSubmitting(false);
          }
          if (data.code === "success") {
            toast.success(data.Message);
            sessionStorage.setItem("code", data.code);
            sessionStorage.setItem("message", data.Message);
            setTimeout(() => {
              router.push("/");
            }, 500);
          }
        } catch {
          toast.error("Lỗi kết nối server!");
          isSubmittingRef.current = false;
          setIsSubmitting(false);
        }
      });
    
    return () => {
      validator.destroy();
    };
  }, [router])
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Nhập mật khẩu"
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Xác Nhận Mật Khẩu</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-button" disabled={isSubmitting}>
          {isSubmitting ? "Đang đăng ký..." : "Đăng Ký"}
        </button>
      </form>
    </>
  )
}