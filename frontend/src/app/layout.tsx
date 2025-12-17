import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nhóm 8",
  description: "Đồ án này là một ứng dụng nhắn tin thời gian thực, cho phép người dùng gửi và nhận tin nhắn ngay lập tức.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
