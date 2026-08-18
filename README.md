# LMS TIẾNG ANH - Hệ Thống Quản Lý Học Tập E-Learning Quốc Tế

Hệ thống Web App **LMS TIẾNG ANH** được thiết kế Production-Ready, hỗ trợ đầy đủ các tiêu chuẩn E-learning phức tạp như **SCORM 1.2/2004, H5P Standalone, Interactive Video (dừng mốc thời gian bật Quiz), Quiz Engine đa dạng (Trắc nghiệm & Điền từ Dropdown trong đoạn văn)** và kết nối trực tiếp với **Supabase Backend (Auth, PostgreSQL, Storage, RLS)**.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons + TinyMCE Rich Text Editor.
- **E-Learning Engine**: SCORM 1.2/2004 Runtime API Engine + H5P Standalone + Interactive Video Engine.
- **Backend & Database**: Supabase (Authentication, PostgreSQL Database, Storage Bucket `lms-files`, Row Level Security - RLS).
- **Deployment**: Tối ưu 100% cho Vercel SPA Deployment (`vercel.json` rewrite configuration).

---

## 🚀 Hướng Dẫn Deploy 1-Click Lên Vercel

1. **Bước 1**: Đăng nhập **[Vercel.com](https://vercel.com)** bằng tài khoản GitHub của bạn.
2. **Bước 2**: Nhấn **Add New Project** -> Chọn Repository **`tienganhpc2018/lms-tieng-anh`**.
3. **Bước 3**: Tại mục **Environment Variables**, điền 2 biến môi trường sau:
   - `VITE_SUPABASE_URL`: `https://wjphcawebrxdvituvuac.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqcGhjYXdlYnJ4ZHZpdHV2dWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMTM2MTYsImV4cCI6MjEwMjU4OTYxNn0.zihrFyxoPiD8ndmFa5az5tHI2GIGAqm-oz5Mohyiueo`
4. **Bước 4**: Bấm **Deploy**. Vercel sẽ tự động build và cấp cho bạn tên miền website E-learning chính thức!

---

## 🗄️ Cấu Trúc Cơ Sở Dữ Liệu SQL (Supabase DB)

Mở **Supabase SQL Editor** (`wjphcawebrxdvituvuac`) và dán toàn bộ mã trong file [`schema.sql`](./schema.sql) để khởi tạo 7 bảng dữ liệu và chính sách phân quyền RLS.

---

## 💻 Chạy Dự Án Tại Local (Môi Trường Phát Triển)

```bash
# 1. Cài đặt các thư viện
npm install

# 2. Chạy ứng dụng dev
npm run dev

# 3. Build sản phẩm production
npm run build
```
