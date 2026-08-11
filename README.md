# Website Xe Nâng Bắc Ninh

Website bán/cho thuê xe nâng gồm React/Vite public site, Express API, MySQL/MariaDB, Prisma và Admin CMS.

## Chức năng

- Public: danh mục, sản phẩm, dịch vụ, blog, trang chi tiết, form lead.
- Admin: đăng nhập HttpOnly cookie; CRUD sản phẩm, danh mục, dịch vụ, blog, lead, cấu hình; audit log.
- Media: Cloudinary; resize/nén WebP; kiểm tra magic bytes; tối đa 10 MB.
- Bảo vệ: Helmet, CORS allowlist, Zod validation, rate limit login/lead, rich-text allowlist sanitizer.

## Cấu trúc

```text
client/src/main.jsx                 React routes
client/src/components/              Public site và Admin CMS
client/src/api.js                   API client dùng cookie
server/index.js                     Express server
server/routes/{public,auth,admin}.js API
server/routes/upload.js             Upload Cloudinary
server/prisma/schema.prisma         MySQL/MariaDB schema
server/prisma/migrations/            Migration nguồn chuẩn
server/prisma/seed.js               Seed dữ liệu mẫu
```

## Local

Yêu cầu Node.js 20+ và MySQL/MariaDB.

```powershell
Copy-Item .env.example server/.env
npm install
npm install --prefix client
npm install --prefix server
npm run prisma:generate --prefix server
npm run prisma:migrate --prefix server
npm run prisma:seed --prefix server
npm run dev
```

- Website: `http://localhost:5173`
- Admin: `http://localhost:5173/admin`
- API: `http://localhost:4000/api`
- Health + DB: `http://localhost:4000/api/health`

## API

```text
GET  /api/public/site-settings
GET  /api/public/categories
GET  /api/public/products
GET  /api/public/products/:slug
GET  /api/public/services
GET  /api/public/services/:slug
GET  /api/public/blog
GET  /api/public/blog/:slug
POST /api/public/leads

POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

GET/POST/PUT/DELETE /api/admin/categories
GET/POST/PUT/DELETE /api/admin/products
GET/POST/PUT/DELETE /api/admin/services
GET/POST/PUT/DELETE /api/admin/blog
GET/PUT/DELETE      /api/admin/leads
GET/PUT             /api/admin/site-settings
GET                 /api/admin/audit-log

POST /api/upload/product-image
POST /api/upload/logo
POST /api/upload/about-image
```

## Kiểm tra

```powershell
npm test --prefix server
npm run prisma:generate --prefix server
npx prisma validate --schema server/prisma/schema.prisma
npm run build --prefix client
```

## Production

1. Tạo MySQL/MariaDB production và backup tự động.
2. Tạo `server/.env` từ `.env.example`; dùng `JWT_SECRET` ngẫu nhiên >= 32 ký tự.
3. Đặt `NODE_ENV=production`, domain thật trong `CORS_ORIGINS`, credential Cloudinary thật.
4. Build: `npm install && npm run prisma:generate --prefix server && npm run prisma:deploy --prefix server && npm run build --prefix client`.
5. Start: `npm run start --prefix server`.
6. Kiểm tra `/api/health`, login/logout, CRUD staging, upload, form lead và mobile.

> Không commit `.env`. Server đọc cấu hình từ `server/.env` khi chạy bằng các script hiện tại. Không dùng mật khẩu seed mẫu. Prisma migrations là nguồn schema chuẩn; `server/full_schema.sql` chỉ là bản dump tham khảo.
>
> Nếu `.env` từng xuất hiện trong Git hoặc được chia sẻ công khai: đổi ngay DB password, JWT secret và Cloudinary API secret; xóa file khỏi Git history sau khi đã rotate credentials.

## Checklist nội dung trước public

- [ ] Thay hotline, email, địa chỉ, Zalo và logo thật.
- [ ] Thay ảnh/nội dung demo.
- [ ] Xác nhận domain, canonical, Open Graph image và `robots.txt`.
- [ ] Test Cloudinary, CORS và cookie trên domain thật.
- [ ] Test backup/restore database.
- [ ] Test keyboard và điện thoại thật.
