# JUSpa Promotion Manager

Hệ thống quản lý chương trình khuyến mãi nội bộ cho JUSpa.

## Hướng dẫn Deploy lên GitHub Pages

Làm theo các bước sau để đưa trang web của bạn lên mạng.

### Điều kiện cần có
- Đã cài đặt [Node.js](https://nodejs.org/) trên máy tính.
- Có một tài khoản [GitHub](https://github.com/).

### Bước 1: Cài đặt các công cụ cần thiết
Mở terminal (hoặc Command Prompt) trong thư mục dự án và chạy lệnh sau. Lệnh này sẽ tải Vite, React, và các thư viện cần thiết về máy.
```bash
npm install
```

### Bước 2: Cấu hình đường dẫn cho GitHub
1. Mở file `vite.config.ts`.
2. Tìm dòng `base: '/JUSpa/'`.
3. **Quan trọng:** Sửa `JUSpa` thành **tên repository GitHub** của bạn. Ví dụ, nếu repository của bạn là `my-spa-manager`, hãy sửa thành `base: '/my-spa-manager/'`.

### Bước 3: Đẩy mã nguồn lên GitHub
1. Tạo một repository mới trên GitHub (ví dụ: `JUSpa`).
2. Mở terminal và chạy các lệnh sau để kết nối và đẩy code lên:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TEN_USER_CUA_BAN/TEN_REPO.git
   git push -u origin main
   ```
   *(Nhớ thay `TEN_USER_CUA_BAN` và `TEN_REPO`)*

### Bước 4: Deploy!
Chạy lệnh sau trong terminal. Lệnh này sẽ tự động build dự án và đẩy phiên bản web hoàn chỉnh lên một nhánh tên là `gh-pages` trên GitHub.
```bash
npm run deploy
```

### Bước 5: Kích hoạt GitHub Pages
1. Vào repository của bạn trên GitHub.
2. Đi tới **Settings > Pages**.
3. Dưới mục **Branch**, chọn nhánh `gh-pages` và thư mục là `/ (root)`.
4. Bấm **Save**.

Đợi vài phút, GitHub sẽ cung cấp cho bạn một đường link вида `https://TEN_USER_CUA_BAN.github.io/TEN_REPO/` để truy cập trang web.
