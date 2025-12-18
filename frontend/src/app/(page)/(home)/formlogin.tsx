"use client"
import Link from "next/link"
import { useEffect, useState, useRef } from "react";
import JustValidate from 'just-validate';
import { toast, Toaster } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
export const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)
  const isSubmittingRef = useRef(false); // Dùng ref để tránh closure issue
  
  useEffect(() => {
    const form = document.getElementById('formLogin') as HTMLFormElement;
    if (!form) return;

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
      .onSuccess(async (event: Event) => {
        event.preventDefault()
        
        // Kiểm tra nếu đang submit thì không làm gì
        if (isSubmittingRef.current) {
          return;
        }
        
        const form = event.target as HTMLFormElement;
        const email = (form.email as HTMLInputElement).value
        const password = (form.password as HTMLInputElement).value
        
        // Lấy giá trị remember từ checkbox trực tiếp
        const rememberCheckbox = form.querySelector('input[type="checkbox"]') as HTMLInputElement;
        const remember = rememberCheckbox?.checked || false;
        
        const dataFinal = {
          email: email,
          password: password,
          remember: remember
        }
        
        // Set flag và state
        isSubmittingRef.current = true;
        setIsSubmitting(true);
        
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_DOMAIN}/login`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(dataFinal)
          });
          
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          
          const data = await res.json();
          console.log("Login response:", data); // Debug log
          
          if (data.code === "error") {
            toast.error(data.Message);
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            return;
          }
          
          if (data.code === "success") {
            toast.success(data.Message || "Đăng nhập thành công!");
            sessionStorage.setItem("code", data.code);
            sessionStorage.setItem("message", data.Message);
            
            // Sử dụng window.location.href để đảm bảo redirect hoạt động
            setTimeout(() => {
              window.location.href = "/chat";
            }, 500);
          } else {
            toast.error(data.Message || "Đăng nhập thất bại!");
            isSubmittingRef.current = false;
            setIsSubmitting(false);
          }
        } catch (error: unknown) {
          console.error("Login error:", error);
          toast.error("Lỗi kết nối server, vui lòng thử lại!");
          isSubmittingRef.current = false;
          setIsSubmitting(false);
        }
      });
    
    // Cleanup validator khi component unmount
    return () => {
      if (validator) {
        validator.destroy();
      }
    };
  }, [])
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

        <div className="form-options">
          <label className="checkbox-label">
            <input type="checkbox" defaultChecked />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <Link href={"/forgotPassword"} className="forgot-link">
            Quên mật khẩu?
          </Link>
        </div>

        <button type="submit" className="auth-button" disabled={isSubmitting}>
          {isSubmitting ? "Đang đăng nhập..." : "Đăng Nhập"}
        </button>
      </form>
    </>
  )
}