# Real-time Chat Application (Nhóm 8)

Dự án ứng dụng nhắn tin thời gian thực với đầy đủ tính năng: nhắn tin cá nhân, nhắn tin nhóm, gửi file/ảnh, thả cảm xúc, thông báo realtime, và quản lý bạn bè.

## 🛠 Công Nghệ Sử Dụng

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Real-time:** Socket.io Client
- **Notifications:** Sonner (Toast)
- **Validation:** Just-validate

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose)
- **Real-time:** Socket.io
- **Authentication:** JWT (JSON Web Token)
- **File Storage:** Cloudinary (Multer)
- **Email Service:** Nodemailer

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Động

### 1. Yêu cầu hệ thống
- Node.js (v18 trở lên)
- MongoDB (Local hoặc Atlas)
- Tài khoản Cloudinary (để lưu trữ ảnh/file)

### 2. Cài đặt Backend

Di chuyển vào thư mục backend và cài đặt dependencies:
```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend` với nội dung sau:
```env
PORT=5000
DOMAIN_FRONTEND="http://localhost:3000"
DATABASE="mongodb+srv://<username>:<password>@cluster.mongodb.net/..."
jwtToken="your_secret_token"
NODE_ENV="dev"

# Cloudinary Config
CLOUDINARY_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Email Config (Nếu có tính năng gửi mail/OTP)
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
```

Khởi động Backend:
```bash
npm start
```
*Backend sẽ chạy tại: `http://localhost:5000`*

### 3. Cài đặt Frontend

Mở một terminal mới, di chuyển vào thư mục frontend:
```bash
cd frontend
npm install
```

Tạo file `.env.local` trong thư mục `frontend`:
```env
NEXT_PUBLIC_DOMAIN="http://localhost:5000"
```

Khởi động Frontend:
```bash
npm run dev
```
*Frontend sẽ chạy tại: `http://localhost:3000`*

---

## 🔧 Các Lỗi Thường Gặp & Cách Fix

### 1. Lỗi `EADDRINUSE: address already in use :::5000`
**Nguyên nhân:** Cổng 5000 đang bị chiếm dụng bởi một tiến trình khác (thường là do tắt server không đúng cách).
**Cách fix (Windows PowerShell):**
```powershell
$process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue; if ($process) { Stop-Process -Id $process.OwningProcess -Force; "Killed process on port 5000" }
```
Sau đó chạy lại `npm start`.

### 2. Lỗi `Failed to fetch` ở Frontend
**Nguyên nhân:** Frontend không thể kết nối tới Backend.
**Cách fix:**
- Kiểm tra xem Backend đã chạy chưa (Terminal backend có báo lỗi gì không?).
- Kiểm tra biến môi trường `NEXT_PUBLIC_DOMAIN` trong `frontend/.env.local` có đúng là `http://localhost:5000` không.
- Đảm bảo CORS ở Backend (`index.ts`) đã cho phép domain của Frontend (`http://localhost:3000`).

### 3. Lỗi TypeScript `Parsing ecmascript source code failed`
**Nguyên nhân:** Lỗi cú pháp trong code (thường do copy paste nhầm vị trí hoặc thiếu dấu đóng mở ngoặc).
**Cách fix:**
- Đọc kỹ log lỗi để tìm dòng bị sai (ví dụ: `centerdata.tsx:567`).
- Kiểm tra lại các dấu `{ }`, `( )` xem đã đóng mở đúng chưa.

### 4. Lỗi không hiện ảnh/file
**Nguyên nhân:** Cấu hình Cloudinary sai hoặc link ảnh bị lỗi.
**Cách fix:**
- Kiểm tra lại `CLOUDINARY_*` trong `backend/.env`.
- Kiểm tra xem domain ảnh có bị chặn bởi thẻ `<img />` của Next.js không (nếu dùng `next/image` cần config `next.config.ts`, nhưng dự án này đang dùng thẻ `img` thường nên ít bị lỗi này).

---

## 📂 Cấu Trúc Dự Án

```
nhom8/
├── backend/             # Server Node.js Express
│   ├── config/          # Cấu hình DB
│   ├── controller/      # Xử lý logic
│   ├── models/          # Schema MongoDB
│   ├── router/          # Định nghĩa API
│   └── index.ts         # Entry point
│
├── frontend/            # Client Next.js
│   ├── src/app/(page)/  # Các trang giao diện
│   │   └── chat/        # Giao diện chính
│   └── helper/          # Các hàm tiện ích
└── README.md            # Tài liệu hướng dẫn
```
