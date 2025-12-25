// Import thư viện Express để tạo web server
const express = require('express');

// Tạo một router mới để định nghĩa các route
const router = express.Router();

// Import controller xử lý xác thực từ file authController
const controller = require('../controllers/authController');

// Định nghĩa route POST /register để đăng ký tài khoản mới
// Khi có request đến /register, sẽ gọi hàm register trong controller
router.post('/register', controller.register);

// Định nghĩa route POST /login để đăng nhập
// Khi có request đến /login, sẽ gọi hàm login trong controller
router.post('/login', controller.login);

// Export router để có thể sử dụng ở file khác (như server.js)
module.exports = router;
