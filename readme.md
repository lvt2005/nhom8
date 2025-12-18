Mini Rock-Paper-Scissors 

UI: http://localhost:3000

PHẦN 1: HƯỚNG DẪN SỬ DỤNG

1. Docker

Download: https://drive.google.com/drive/folders/1k1rzH2b5VRopvMw1H7ZyeMdncj6vV-HL?usp=sharing

1.1 Tạo thư mục mới tải 2 file từ link về

1.2 Mở docker bật terminal cd đến thư mục chứa 2 file đó.

1.3 Paste lệnh này  docker load -i rps-complete-docker-images.tar     (Đợi load tí)

1.4 Paste tiếp lệnh này  docker-compose up -d  và mở UI


2. Còn muốn run ide thì đây:

2.1 Check cài đủ Node.js, npm và MySQL đang chạy đúng cấu hình.

2.2 Mở .env trong backend sửa cấu hình.

2.3 cd vào 2 thư mục backend và frontend run lệnh npm install (npm run build cho frontend)  và npm start



PHẦN 2: CHI TIẾT HỆ THỐNG

1. Công nghệ sử dụng

 - Về Backend

Node.js: Nền tảng chạy JavaScript phía server.


Express.js: Framework xây dựng API HTTP và quản lý middleware.


Socket.IO: Thư viện giao tiếp real-time giữa server và nhiều client.


Sequelize: ORM để thao tác với MySQL bằng JavaScript.


MySQL: Hệ quản trị cơ sở dữ liệu lưu thông tin người dùng, phòng chơi, kết quả.


JWT: Xác thực người dùng qua token.



 - Về Frontend

Next.js: Framework React cho xây dựng giao diện, routing, tối ưu SEO.


Socket.IO Client: Kết nối real-time tới backend.


Axios: Gửi request HTTP tới backend (đăng nhập, đăng ký).


CSS Modules: Tạo giao diện đẹp, tách biệt từng component.





2. Nơi sử dụng


2.1 Express.js: Xây dựng các API như /auth/login, /auth/register, quản lý middleware xác thực.


2.2 Socket.IO:


+ Server: Nhận kết nối từ nhiều client, quản lý hàng đợi, ghép cặp, nhận lựa chọn, gửi kết quả.

+ Client: Gửi sự kiện (join queue, chọn kéo/búa/bao), nhận kết quả real-time.

2.3 Sequelize + MySQL: Lưu thông tin người dùng, phòng chơi, kết quả trận đấu.


2.4 JWT: Bảo vệ các API, chỉ cho phép người dùng đã đăng nhập truy cập.


2.5 Next.js: Tạo các trang giao diện (login, lobby, game room), quản lý state, nhận và hiển thị kết quả real-time.



3. Logic chính trong dự án


3.1 Đăng nhập/Đăng ký


Người dùng đăng ký hoặc đăng nhập qua API.


Backend xác thực, trả về JWT token.


Frontend lưu token, gửi kèm khi gọi API cần bảo mật.


3.2 Ghép cặp


Khi người chơi nhấn "Tìm trận", client gửi sự kiện join_queue qua socket.


Server quản lý hàng đợi, khi có 2 người sẽ tạo phòng chơi (GameRoom), lưu vào DB, gửi sự kiện matched cho cả 2 client.


3.3 Chơi game


Mỗi người chơi chọn "Kéo", "Búa", hoặc "Bao" và gửi sự kiện player_choice qua socket.


Server nhận đủ 2 lựa chọn, tính kết quả (thắng/thua/hòa), cập nhật điểm, lưu kết quả nếu cần.


Server gửi sự kiện round_result cho cả 2 client, cập nhật giao diện.


3.4 Phát sóng kết quả


Sử dụng socket.to(roomId).emit(...) để gửi kết quả, điểm số, trạng thái trận đấu cho đúng phòng.


3.5 Quản lý nhiều client


Server có thể xử lý nhiều phòng chơi, nhiều người chơi cùng lúc (multi client-server).


