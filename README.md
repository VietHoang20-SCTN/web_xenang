# Website xe nâng Bắc Ninh

Ứng dụng web giới thiệu, bán và cho thuê xe nâng theo yêu cầu khách hàng trong `yeucaukhachhang.pdf`, có backend API, PostgreSQL và admin CMS.

## Tính năng hiện có

- Website public lấy dữ liệu sản phẩm/danh mục/cấu hình từ API.
- Form yêu cầu tư vấn/báo giá/thuê xe lưu lead vào PostgreSQL.
- Backend Express với public API, auth API và admin CRUD API.
- Prisma schema cho PostgreSQL.
- Admin đăng nhập thật bằng JWT.
- Admin CRUD sản phẩm, danh mục, lead và cấu hình liên hệ.
- Admin hỗ trợ sửa sản phẩm, sửa danh mục và CRUD dịch vụ.
- Upload ảnh sản phẩm từ thiết bị, tự động resize/nén sang WebP bằng `sharp`.
- Sản phẩm có ảnh đại diện và gallery ảnh chi tiết.
- Nhập thông số kỹ thuật sản phẩm bằng từng dòng có nút thêm/xóa.
- Quản lý lead bằng tìm kiếm, lọc trạng thái, Kanban pipeline và modal chi tiết.
- UI public dùng Montserrat/Inter, màu vàng `#FFC107`, đen/xám đậm `#1F2937`, Card UI mobile-first.
- Dữ liệu fallback vẫn nằm trong `src/data.js` để giao diện public không trắng khi API chưa chạy.

## Chuẩn bị môi trường

Tạo file `.env` từ `.env.example`:

```bash
copy .env.example .env
```

Cập nhật `DATABASE_URL` theo PostgreSQL của bạn, ví dụ:

```text
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/xenang?schema=public"
JWT_SECRET="change-this-secret-before-production"
PORT=4000
VITE_API_URL="http://localhost:4000/api"
ADMIN_EMAIL="admin@xenang.local"
ADMIN_PASSWORD="Admin@123456"
```

## Cài đặt database

Sau khi PostgreSQL đã có database `xenang`, chạy:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Tài khoản admin mặc định lấy từ `.env`:

```text
admin@xenang.local / Admin@123456
```

## Chạy dự án

Chạy frontend và backend cùng lúc:

```bash
npm run dev
```

- Website: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`
- API: `http://localhost:4000/api`

## Build production

```bash
npm run build
npm run preview
```

## Cấu trúc chính

```text
server/index.js              Express API server
server/routes/public.js      Public API cho website
server/routes/auth.js        Đăng nhập admin
server/routes/admin.js       Admin CRUD API
server/middleware/auth.js    Middleware JWT
prisma/schema.prisma         Database schema PostgreSQL
prisma/seed.js               Seed dữ liệu mẫu và admin
src/api.js                   API client frontend
src/main.jsx                 Website public và admin UI
src/data.js                  Dữ liệu fallback
```

## API chính

- `GET /api/public/site-settings`
- `GET /api/public/categories`
- `GET /api/public/products`
- `GET /api/public/services`
- `POST /api/public/leads`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST/PUT/DELETE /api/admin/categories`
- `GET/POST/PUT/DELETE /api/admin/products`
- `GET/POST/PUT/DELETE /api/admin/services`
- `GET/PUT/DELETE /api/admin/leads`
- `GET/PUT /api/admin/site-settings`
- `POST /api/upload/product-image`

## Ghi chú production

- Đổi `JWT_SECRET` trước khi deploy.
- Đổi mật khẩu admin mặc định sau khi seed.
- Ảnh sản phẩm upload từ admin được nén sang WebP, lưu tại `server/uploads` và phục vụ qua `/uploads/...`.
- Nếu deploy tách frontend/backend, cập nhật `VITE_API_URL` đúng domain API.
