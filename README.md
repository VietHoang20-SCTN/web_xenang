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

## 🚀 Deploy Free (Neon + Render)

### 1. Tạo PostgreSQL miễn phí trên Neon

1. Vào [neon.tech](https://neon.tech) → Sign Up bằng GitHub
2. Tạo project `xenang` → Copy **Connection string**
3. Chạy migrate + seed với DB mới:

```bash
$env:DATABASE_URL="postgresql://...neon.tech/xenang?sslmode=require"
npm run prisma:migrate
npm run prisma:seed
```

### 2. Deploy lên Render

1. Vào [render.com](https://render.com) → Sign Up bằng GitHub
2. **New +** → **Web Service** → Connect repo `VietHoang20-SCTN/web_xenang`
3. Cấu hình:

| Field | Value |
|---|---|
| Build Command | `npm install --include=dev && npm run prisma:generate && npm run build` |
| Start Command | `node server/index.js` |
| Instance Type | **Free** |

4. Thêm **Environment Variables**:

```
NODE_ENV=production
DATABASE_URL=postgresql://... (Neon connection string)
JWT_SECRET=5e8fecfc8718327fbe024e9029c7ef7c249d2da31abbda88908c822981db4561
CORS_ORIGINS=https://xenang.onrender.com
PORT=4000
VITE_API_URL=https://xenang.onrender.com/api
ADMIN_EMAIL=admin@xenang.local
ADMIN_PASSWORD=Admin@123456
```

5. Click **Create Web Service** → Đợi build ~5 phút

### 3. Sau khi deploy

- 🌐 Website: `https://xenang.onrender.com`
- 🔧 Admin: `https://xenang.onrender.com/admin`
- 💡 Dùng [UptimeRobot](https://uptimerobot.com) ping web mỗi 5 phút để tránh Render sleep

## Ghi chú production

- Đổi `JWT_SECRET` và `ADMIN_PASSWORD` trước khi public chính thức.
- Ảnh upload lưu tại `server/uploads/`, Render free disk sẽ reset khi redeploy → nên dùng Cloudinary hoặc S3 cho production thật.
- Nếu dùng domain riêng, cập nhật `CORS_ORIGINS` và `VITE_API_URL` tương ứng.
