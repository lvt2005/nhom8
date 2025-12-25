# 📝 Mini Blog Platform API

Hệ thống quản lý blog đơn giản với đầy đủ chức năng tạo, đọc, cập nhật và xóa bài viết, kèm theo hệ thống xác thực người dùng.

## 📋 Thông tin dự án

- **Tên dự án:** Mini Blog Platform API
- **Mô tả:** Nền tảng blog cho phép người dùng đăng ký, đăng nhập và quản lý bài viết cá nhân
- **Server:** http://localhost:5000
- **Client:** http://localhost:5173

### ✨ Tính năng chính

- 🔐 Xác thực người dùng (Đăng ký, Đăng nhập, JWT)
- ✍️ Tạo và quản lý bài viết blog
- 📝 Chỉnh sửa và xóa bài viết của riêng mình
- 👤 Quản lý hồ sơ người dùng
- 🖼️ Upload ảnh cho bài viết
- 📱 Giao diện responsive với Tailwind CSS

## 🛠️ Công nghệ sử dụng

### Frontend (Client)
- **Vue 3** - Progressive JavaScript Framework
- **Vite** - Build tool & Development Server
- **Vue Router** - Routing
- **Pinia** - State Management
- **Axios** - HTTP Client
- **Tailwind CSS** - Utility-first CSS Framework

### Backend (Server)
- **Node.js** - JavaScript Runtime
- **Express.js** - Web Framework
- **MySQL** - Database
- **Sequelize** - ORM (Object-Relational Mapping)
- **JWT** - JSON Web Token for Authentication
- **bcryptjs** - Password Hashing
- **Multer** - File Upload Middleware
- **CORS** - Cross-Origin Resource Sharing

## 📁 Tổ chức thư mục

```
E4_Mini Blog Platform API/
│
├── start_project.bat          # Script khởi chạy nhanh cả client và server nhưng phải tự cấu hình database trước
│
├── client/                    # Frontend Application
│   ├── public/               # Static files
│   ├── src/
│   │   ├── api/             # API service layer
│   │   │   ├── axiosInstance.js    # Axios configuration
│   │   │   └── blog.js             # Blog API calls
│   │   │
│   │   ├── assets/          # Static resources
│   │   │   ├── fonts/       # Font files
│   │   │   ├── icons/       # Icon files
│   │   │   └── images/      # Image files
│   │   │
│   │   ├── components/      # Reusable components
│   │   │   ├── layout/      # Layout components
│   │   │   └── ui/          # UI components
│   │   │
│   │   ├── composables/     # Vue composables
│   │   │   ├── useAuth.js   # Authentication composable
│   │   │   └── useForm.js   # Form handling composable
│   │   │
│   │   ├── layouts/         # Layout wrappers
│   │   │   ├── AuthLayout.vue      # Layout cho trang auth
│   │   │   └── DefaultLayout.vue   # Layout mặc định
│   │   │
│   │   ├── router/          # Vue Router configuration
│   │   │   └── index.js     # Routes definition
│   │   │
│   │   ├── store/           # Pinia stores
│   │   │   ├── auth.js      # Authentication state
│   │   │   └── user.js      # User state
│   │   │
│   │   ├── views/           # Page components
│   │   │   ├── BlogCreate.vue      # Tạo bài viết
│   │   │   ├── BlogDetail.vue      # Chi tiết bài viết
│   │   │   ├── Home.vue            # Trang chủ
│   │   │   ├── Login.vue           # Đăng nhập
│   │   │   ├── Profile.vue         # Hồ sơ
│   │   │   └── Register.vue        # Đăng ký
│   │   │
│   │   ├── App.vue          # Root component
│   │   ├── main.js          # Application entry point
│   │   └── style.css        # Global styles
│   │
│   ├── .env                  # Environment variables
│   ├── index.html           # HTML template
│   ├── package.json         # Dependencies & scripts
│   ├── postcss.config.js    # PostCSS configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── vite.config.js       # Vite configuration
│
└── server/                   # Backend Application
    ├── src/
    │   ├── config/          # Configuration files
    │   │   └── db.js        # Database connection
    │   │
    │   ├── controllers/     # Request handlers
    │   │   ├── authController.js    # Authentication logic
    │   │   └── blogController.js    # Blog CRUD operations
    │   │
    │   ├── middlewares/     # Express middlewares
    │   │   ├── authMiddleware.js    # JWT verification
    │   │   └── errorHandler.js      # Error handling
    │   │
    │   ├── models/          # Sequelize models
    │   │   ├── Blog.js      # Blog model
    │   │   └── User.js      # User model
    │   │
    │   ├── routes/          # API routes
    │   │   ├── auth.js      # Authentication routes
    │   │   └── blog.js      # Blog routes
    │   │
    │   └── index.js         # Server entry point
    │
    ├── uploads/             # User uploaded files
    ├── .env                 # Environment variables
    ├── package.json         # Dependencies & scripts
    └── seed.js              # Database seeding script
```

## 🚀 Hướng dẫn cài đặt và chạy

### Yêu cầu hệ thống
- Node.js >= 14.x
- MySQL >= 5.7
- npm hoặc yarn

### Bước 1: Cài đặt dependencies

**Cài đặt cho Server:**
```bash
cd server
npm install
```

**Cài đặt cho Client:**
```bash
cd client
npm install
```

### Bước 2: Cấu hình Database

1. Tạo database MySQL:
```sql
CREATE DATABASE blog_platform;
```

2. Cấu hình file `.env` trong thư mục `server/`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=blog_platform
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

3. Cấu hình file `.env` trong thư mục `client/`:
```env
VITE_API_URL=http://localhost:5000
```

### Bước 3: Chạy ứng dụng

**Cách 1: Sử dụng script tự động**
```bash
# Chạy từ thư mục gốc
start_project.bat
```

**Cách 2: Chạy thủ công**

Terminal 1 - Chạy Server:
```bash
cd server
npm run dev
```

Terminal 2 - Chạy Client:
```bash
cd client
npm run dev
```

### Bước 4: Truy cập ứng dụng

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Blog
- `GET /api/blogs` - Lấy danh sách tất cả blog
- `GET /api/blogs/:id` - Lấy chi tiết blog
- `POST /api/blogs` - Tạo blog mới (yêu cầu authentication)
- `PUT /api/blogs/:id` - Cập nhật blog (yêu cầu authentication)
- `DELETE /api/blogs/:id` - Xóa blog (yêu cầu authentication)

## 👥 Tác giả

Nhóm 8 - Lập trình mạng

## 📄 License

MIT License
