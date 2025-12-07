# Hướng dẫn đẩy code lên GitHub nhánh "frontend--react"

## Các bước thực hiện:

### 1. Thêm remote repository (nếu chưa có)
```bash
git remote add origin https://github.com/lvt2005/nhom8.git
```

### 2. Kiểm tra remote đã được thêm
```bash
git remote -v
```

### 3. Tạo và chuyển sang nhánh "frontend--react"
```bash
git checkout -b frontend--react
```

Hoặc nếu nhánh đã tồn tại trên remote:
```bash
git checkout -b frontend--react origin/frontend--react
```

### 4. Thêm tất cả các file đã thay đổi
```bash
git add .
```

### 5. Commit các thay đổi
```bash
git commit -m "Add React authentication forms: Login, Register, Forgot Password, OTP Verification, Reset Password"
```

### 6. Push code lên nhánh frontend--react
```bash
git push -u origin frontend--react
```

Hoặc nếu nhánh đã tồn tại:
```bash
git push origin frontend--react
```

## Lưu ý:

- Nếu lần đầu push, GitHub có thể yêu cầu xác thực
- Nếu gặp lỗi "remote already exists", dùng lệnh:
  ```bash
  git remote set-url origin https://github.com/lvt2005/nhom8.git
  ```
- Nếu nhánh frontend--react đã tồn tại trên remote và có code khác, bạn có thể cần pull trước:
  ```bash
  git pull origin frontend--react --allow-unrelated-histories
  ```

## Kiểm tra sau khi push:
Truy cập: https://github.com/lvt2005/nhom8/tree/frontend--react

