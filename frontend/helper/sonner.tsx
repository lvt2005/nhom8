"use client"
import { useEffect } from "react"
import { toast } from 'sonner';
export const Sonner = () => {
  useEffect(() => {
    const code = sessionStorage.getItem("code")
    const message = sessionStorage.getItem("message")
    if (code == "success") {
      toast.success(message)
      sessionStorage.removeItem("message");
      sessionStorage.removeItem("code");
    }
    if (code == "error") {
      toast.error(message)
      sessionStorage.removeItem("message");
      sessionStorage.removeItem("code");
    }
  }, [])
  return null
}