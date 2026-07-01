# Tài liệu hệ thống Website Xe Nâng Bắc Ninh

## 1. Tổng quan hệ thống

Hệ thống này là website giới thiệu, bán và cho thuê xe nâng cho doanh nghiệp kho vận/logistics. Dự án gồm 2 phần chính:

- **Website public**: hiển thị trang chủ, danh mục sản phẩm, dịch vụ, form nhận báo giá, thông tin liên hệ và bản đồ.
- **Admin CMS**: quản trị sản phẩm, danh mục, dịch vụ, lead khách hàng, cấu hình website và upload ảnh sản phẩm.

Dữ liệu chính được lưu trong MariaDB/MySQL thông qua Prisma ORM. Frontend gọi API từ backend Express để lấy dữ liệu động.

---

## 2. Công nghệ sử dụng

### Frontend

- **React**: xây dựng giao diện website public và admin CMS.
- **Vite**: dev server và build frontend production.
- **CSS thuần**: toàn bộ giao diện nằm trong `src/styles.css`.
- **Lucide React**: bộ icon dùng trong UI.
- **Google Fonts**:
  - `Be Vietnam Pro` cho body text.
  - `Montserrat` cho heading, brand và button.

Các file frontend chính:

```text
src/main.jsx       Giao diện public website và admin CMS
src/styles.css     Toàn bộ style UI
src/api.js         API client, cấu hình API URL và xử lý token admin
src/data.js        Dữ liệu fallback khi API chưa chạy
```

### Backend

- **Node.js**: runtime backend.
- **Express 5**: xây dựng REST API.
- **Prisma ORM**: kết nối và thao tác database.
- **JWT**: xác thực admin.
- **bcryptjs**: mã hóa mật khẩu admin.
- **multer**: nhận file upload từ admin.
- **sharp**: resize/nén ảnh sản phẩm sang WebP.
- **cors**: cho phép frontend gọi API.
- **dotenv**: đọc biến môi trường từ `.env`.

Các file backend chính:

```text
server/index.js              Entry point Express API
server/routes/public.js      API public cho website
server/routes/auth.js        API đăng nhập admin
server/routes/admin.js       API quản trị CRUD
server/routes/upload.js      API upload ảnh sản phẩm
server/middleware/auth.js    Middleware kiểm tra JWT
server/prisma.js             Prisma client
server/utils.js              Hàm tiện ích như slugify, parseSpecs
server/uploads/              Nơi lưu ảnh upload sau khi nén WebP
```

### Database

Hệ thống sử dụng:

```text
MariaDB/MySQL
```

Kết nối database được cấu hình trong Prisma:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

File schema database:

```text
prisma/schema.prisma
```

---

## 3. Cấu trúc database

Các bảng/model chính:

### AdminUser

Lưu tài khoản quản trị.

Trường chính:

- `email`: email đăng nhập, unique.
- `passwordHash`: mật khẩu đã hash.
- `name`: tên admin.
- `role`: hiện tại là `ADMIN`.

### Category

Lưu danh mục sản phẩm.

Trường chính:

- `name`
- `slug`
- `description`
- `sortOrder`
- `isActive`

### Product

Lưu sản phẩm xe nâng.

Trường chính:

- `name`
- `slug`
- `categoryId`
- `tag`
- `image`: ảnh đại diện.
- `gallery`: JSON danh sách ảnh chi tiết.
- `summary`
- `description`
- `specs`: JSON danh sách thông số kỹ thuật.
- `isFeatured`
- `isActive`

### Service

Lưu dịch vụ hiển thị trên website.

Trường chính:

- `title`
- `slug`
- `description`
- `icon`
- `sortOrder`
- `isActive`

### Lead

Lưu yêu cầu tư vấn/báo giá từ khách hàng.

Trường chính:

- `name`
- `phone`
- `company`
- `need`
- `productId`
- `status`
- `note`

Các trạng thái lead:

```text
NEW         Mới
CONTACTED   Đã liên hệ
QUOTED      Đã báo giá
DONE        Hoàn tất
CANCELLED   Hủy
```

### SiteSetting

Lưu cấu hình website.

Trường chính:

- `brand`
- `hotline`
- `zalo`
- `email`
- `address`
- `mapEmbed`

---

## 4. API chính

Base API local mặc định:

```text
http://localhost:4000/api
```

### Public API

```text
GET  /api/public/site-settings
GET  /api/public/categories
GET  /api/public/products
GET  /api/public/products/:slug
GET  /api/public/services
POST /api/public/leads
```

### Auth API

```text
POST /api/auth/login
GET  /api/auth/me
```

### Admin API

Các API admin yêu cầu JWT token.

```text
GET/POST/PUT/DELETE /api/admin/categories
GET/POST/PUT/DELETE /api/admin/products
GET/POST/PUT/DELETE /api/admin/services
GET/PUT/DELETE      /api/admin/leads
GET/PUT             /api/admin/site-settings
```

### Upload API

```text
POST /api/upload/product-image
```

Upload ảnh yêu cầu token admin. Ảnh sẽ được resize tối đa `1920x1920`, nén sang WebP và lưu vào:

```text
server/uploads
```

Ảnh được public qua URL:

```text
/uploads/ten-file.webp
```

---

## 5. Cài đặt môi trường local

### Yêu cầu cần cài đặt

- **Node.js** phiên bản khuyến nghị: Node 18+ hoặc Node 20+.
- **npm** đi kèm Node.js.
- **MariaDB/MySQL**.
- Git nếu cần clone/pull code.

### Cài dependencies

Tại thư mục project:

```bash
npm install
```

### Tạo database MySQL

Tạo database tên ví dụ:

```text
xenang
```

Local có thể dùng MySQL port `3306`:

```text
mysql://postgres:postgres@localhost:3306/xenang
```

Nếu máy khác dùng port mặc định MySQL thì thường là `3306`.

---

## 6. File cấu hình môi trường `.env`

Tạo file `.env` ở root project:

```text
DATABASE_URL="mysql://postgres:postgres@localhost:3306/xenang"
JWT_SECRET="change-this-secret-before-production"
PORT=4000
VITE_API_URL="http://localhost:4000/api"
ADMIN_EMAIL="admin@xenang.local"
ADMIN_PASSWORD="Admin@123456"
```

Ý nghĩa từng biến:

### `DATABASE_URL`

Chuỗi kết nối MySQL cho Prisma.

Ví dụ local:

```text
DATABASE_URL="mysql://postgres:postgres@localhost:3306/xenang"
```

Ví dụ production:

```text
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DATABASE"
```

### `JWT_SECRET`

Khóa bí mật để ký token đăng nhập admin.

Khi deploy production cần đổi thành chuỗi mạnh, dài và khó đoán.

### `PORT`

Port chạy backend Express.

Local mặc định:

```text
PORT=4000
```

### `VITE_API_URL`

URL frontend dùng để gọi backend API.

Local:

```text
VITE_API_URL="http://localhost:4000/api"
```

Production nếu backend là `https://api.example.com`:

```text
VITE_API_URL="https://api.example.com/api"
```

Nếu frontend và backend cùng domain, có thể cấu hình theo domain thực tế.

### `ADMIN_EMAIL` và `ADMIN_PASSWORD`

Thông tin tài khoản admin dùng khi chạy seed.

Sau khi deploy production nên đổi mật khẩu mặc định.

---

## 7. Khởi tạo Prisma và dữ liệu mẫu

Sau khi đã cấu hình `.env` và database MySQL, chạy:

```bash
npm run prisma:generate
npm run prisma:dbpush
npm run prisma:seed
```

Ý nghĩa:

- `prisma:generate`: tạo Prisma Client.
- `prisma:dbpush`: tạo bảng trong MySQL theo `schema.prisma`.
- `prisma:seed`: tạo dữ liệu mẫu và tài khoản admin.

> **Lưu ý:** Với MySQL, dùng `npx prisma db push` thay `npm run prisma:migrate` cho lần đầu tạo database mới. Nếu cần migration, chạy `npx prisma migrate dev --name init` sau khi xoá folder `migrations/`.

---

## 8. Chạy dự án local

Chạy frontend và backend cùng lúc:

```bash
npm run dev
```

Các URL local:

```text
Website public: http://localhost:5173
Admin CMS:      http://localhost:5173/admin
API backend:    http://localhost:4000/api
Health check:   http://localhost:4000/api/health
```

Chạy riêng backend:

```bash
npm run server
```

Chạy riêng frontend:

```bash
npm run client
```

Build frontend production:

```bash
npm run build
```

Preview bản build:

```bash
npm run preview
```

---

## 9. Các chức năng đã xây dựng

### Website public

- Full-page Scroll / Scroll Snap UI.
- Hero section hiện đại.
- Carousel ảnh sản phẩm tự động chạy.
- Danh mục sản phẩm có filter theo category.
- Card sản phẩm gồm ảnh đại diện, tag, mô tả, thông số và CTA.
- Modal xem album/chi tiết sản phẩm.
- Form yêu cầu tư vấn/báo giá.
- Section dịch vụ.
- Section giới thiệu + form lead.
- Section liên hệ có Google Maps iframe.
- Floating action gọi điện và Zalo.
- Button Zalo dùng ảnh `public/logo-zalo-vector.png`.

### Admin CMS

- Đăng nhập admin bằng JWT.
- CRUD sản phẩm.
- CRUD danh mục.
- CRUD dịch vụ.
- Upload ảnh sản phẩm, tự resize/nén WebP.
- Quản lý ảnh đại diện và gallery sản phẩm.
- Quản lý lead theo dạng Kanban pipeline.
- Tìm kiếm/lọc lead theo trạng thái.
- Modal chi tiết lead, cập nhật trạng thái và ghi chú.
- Cấu hình website: brand, hotline, Zalo, email, địa chỉ, Google Maps.

---

## 10. Các file setting cần sửa khi deploy online

### 1. `.env`

Đây là file quan trọng nhất cần sửa khi deploy.

Cần cập nhật:

```text
DATABASE_URL
JWT_SECRET
PORT
VITE_API_URL
ADMIN_EMAIL
ADMIN_PASSWORD
```

Ví dụ production:

```text
DATABASE_URL="mysql://user:password@db-host:3306/xenang"
JWT_SECRET="mot-chuoi-bi-mat-rat-dai-va-kho-doan"
PORT=4000
VITE_API_URL="https://api.tenmiencuaban.com/api"
ADMIN_EMAIL="admin@tenmiencuaban.com"
ADMIN_PASSWORD="mat-khau-manh"
```

### 2. `src/api.js`

File này đang lấy API URL từ biến môi trường:

```js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
```

Thông thường **không cần sửa code file này**, chỉ cần cấu hình đúng `VITE_API_URL` trong `.env` hoặc biến môi trường của hosting.

### 3. `server/index.js`

Backend đang dùng:

```js
const port = process.env.PORT || 4000
app.use(cors())
```

Nếu deploy production nghiêm ngặt, nên cấu hình CORS chỉ cho phép domain frontend thay vì mở toàn bộ.

Ví dụ cần chỉnh sau này:

```js
app.use(cors({ origin: 'https://tenmiencuaban.com' }))
```

### 4. Cấu hình trong Admin CMS

Sau khi deploy, đăng nhập `/admin` và cập nhật:

- Tên thương hiệu.
- Hotline.
- Link Zalo.
- Email.
- Địa chỉ.
- Google Maps iframe/link nhúng.

Các dữ liệu này lưu trong bảng `SiteSetting`, không cần sửa code.

### 5. Ảnh/logo public

Logo Zalo hiện dùng file:

```text
public/logo-zalo-vector.png
```

Nếu muốn đổi ảnh Zalo/icon khác, thay file này hoặc sửa CSS trong:

```text
src/styles.css
```

Rule đang dùng:

```css
.zalo-icon-btn {
  background: url('/logo-zalo-vector.png') center / contain no-repeat;
}
```

---

## 11. Hướng dẫn deploy online

Có 2 hướng deploy phổ biến.

---

### Phương án A: Deploy frontend và backend tách riêng

Ví dụ:

- Frontend: Vercel/Netlify.
- Backend: Render/Railway/VPS.
- Database: MySQL cloud (Render MySQL, Railway MySQL, Aiven, hoặc VPS MySQL).

#### Bước 1: Tạo MySQL online

Tạo database MySQL trên nhà cung cấp cloud.

Lấy connection string dạng:

```text
mysql://USER:PASSWORD@HOST:3306/DATABASE
```

Đưa chuỗi này vào biến môi trường backend:

```text
DATABASE_URL="..."
```

#### Bước 2: Deploy backend

Backend cần chạy command:

```bash
npm install
npm run prisma:generate
npx prisma db push
npm run prisma:seed
npm run server
```

Tùy nền tảng deploy, thường cấu hình:

Build command:

```bash
npm install && npm run prisma:generate
```

Start command:

```bash
npm run server
```

Sau khi backend lên online, kiểm tra:

```text
https://api-domain.com/api/health
```

Nếu trả về:

```json
{ "ok": true }
```

là backend chạy ổn.

#### Bước 3: Tạo bảng database production

Trên server hoặc deploy console chạy:

```bash
npx prisma db push
```

Sau đó seed admin lần đầu:

```bash
npm run prisma:seed
```

Lưu ý: nếu production đã có dữ liệu thật, cần cẩn thận khi seed lại.

#### Bước 4: Deploy frontend

Frontend cần biến môi trường:

```text
VITE_API_URL="https://api-domain.com/api"
```

Build command:

```bash
npm run build
```

Output folder:

```text
dist
```

Sau khi deploy frontend, truy cập:

```text
https://tenmiencuaban.com
https://tenmiencuaban.com/admin
```

---

### Phương án B: Deploy frontend và backend cùng VPS

Ví dụ dùng VPS Ubuntu + Nginx + PM2 + MySQL.

#### Bước 1: Cài môi trường VPS

Cần cài:

```bash
node
npm
mysql-server
nginx
pm2
```

#### Bước 2: Clone source code

```bash
git clone <repo-url>
cd xenang
npm install
```

#### Bước 3: Tạo `.env` production

```text
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/xenang"
JWT_SECRET="chuoi-bi-mat-production"
PORT=4000
VITE_API_URL="https://tenmiencuaban.com/api"
ADMIN_EMAIL="admin@tenmiencuaban.com"
ADMIN_PASSWORD="mat-khau-manh"
```

#### Bước 4: Setup database

```bash
npm run prisma:generate
npx prisma db push
npm run prisma:seed
```

#### Bước 5: Build frontend

```bash
npm run build
```

#### Bước 6: Chạy backend bằng PM2

```bash
pm2 start server/index.js --name xenang-api
pm2 save
```

#### Bước 7: Cấu hình Nginx

Có thể cấu hình:

- `/` serve thư mục `dist`.
- `/api` proxy về `http://localhost:4000/api`.
- `/uploads` proxy hoặc alias tới backend/static uploads.

Ví dụ ý tưởng Nginx:

```nginx
server {
    server_name tenmiencuaban.com;

    root /path/to/xenang/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        proxy_pass http://localhost:4000/uploads/;
        proxy_set_header Host $host;
    }
}
```

Sau đó cài SSL bằng Certbot/Let's Encrypt.

---

## 12. Lưu ý quan trọng khi deploy production

### Bảo mật

- Đổi `JWT_SECRET` thành chuỗi mạnh.
- Đổi `ADMIN_EMAIL` và `ADMIN_PASSWORD` trước khi seed production.
- Không commit file `.env` lên Git.
- Nên cấu hình CORS giới hạn domain frontend.
- Nên bật HTTPS.

### Database

- Backup MySQL định kỳ.
- Không chạy lại seed nếu không cần sau khi website đã có dữ liệu thật.
- Khi thay đổi schema, cần chạy migration cẩn thận.

### Upload ảnh

Hiện ảnh upload lưu trong:

```text
server/uploads
```

Nếu deploy lên các nền tảng filesystem tạm thời như Render/Heroku, ảnh có thể mất khi redeploy/restart.

Khuyến nghị production:

- Dùng VPS có disk ổn định, hoặc
- Dùng object storage như S3, Cloudinary, R2.

Nếu chuyển sang cloud storage, cần sửa logic trong:

```text
server/routes/upload.js
src/api.js assetUrl()
```

### Google Maps

Map lấy từ cấu hình admin `mapEmbed`.

Nên dùng iframe embed HTML hoặc link embed chuẩn của Google Maps để hiển thị tốt.

### Zalo

Nút Zalo dùng link trong cấu hình admin:

```text
SiteSetting.zalo
```

Icon Zalo dùng file:

```text
public/logo-zalo-vector.png
```

---

## 13. Checklist đưa website lên online

### Trước khi deploy

- Kiểm tra build local:

```bash
npm run build
```

- Kiểm tra backend local:

```bash
npm run server
```

- Kiểm tra API health:

```text
/api/health
```

### Database

- Tạo MySQL online.
- Cập nhật `DATABASE_URL`.
- Chạy `npx prisma db push`.
- Chạy seed lần đầu.

### Backend

- Cấu hình biến môi trường production.
- Deploy backend.
- Kiểm tra `/api/health`.
- Kiểm tra upload ảnh.

### Frontend

- Cấu hình `VITE_API_URL` trỏ đúng backend.
- Build `npm run build`.
- Deploy folder `dist`.
- Kiểm tra `/admin`.

### Sau khi deploy

- Đăng nhập admin.
- Đổi/cập nhật cấu hình website.
- Tạo danh mục/sản phẩm/dịch vụ thật.
- Test form lead.
- Test gọi điện/Zalo.
- Test Google Maps.
- Test upload ảnh sản phẩm.
- Kiểm tra responsive mobile.

---

## 14. Lệnh npm hiện có

```json
{
  "dev": "concurrently \"npm run server\" \"npm run client\"",
  "client": "vite --host 0.0.0.0",
  "server": "node server/index.js",
  "build": "vite build",
  "preview": "vite preview --host 0.0.0.0",
  "prisma:generate": "prisma generate",
  "prisma:seed": "prisma db seed"
}
```

---

## 15. Ghi chú bảo trì sau này

Khi muốn chỉnh giao diện public/admin:

```text
src/main.jsx
src/styles.css
```

Khi muốn chỉnh API hoặc logic backend:

```text
server/routes/*.js
server/index.js
server/middleware/auth.js
server/utils.js
```

Khi muốn chỉnh cấu trúc database:

```text
prisma/schema.prisma
```

Sau khi chỉnh schema cần chạy:

```bash
npm run prisma:migrate
npm run prisma:generate
```

Khi muốn đổi fallback data public:

```text
src/data.js
```

---

## 16. Tóm tắt nhanh

- **Frontend**: React + Vite + CSS thuần.
- **Backend**: Node.js + Express.
- **Database**: MySQL (MariaDB).
- **ORM**: Prisma.
- **Auth admin**: JWT + bcryptjs.
- **Upload ảnh**: multer + sharp, lưu local tại `server/uploads`, cloud backup qua Cloudinary.
- **Deploy cần sửa chính**: `.env`, đặc biệt `DATABASE_URL`, `JWT_SECRET`, `VITE_API_URL`, admin account.
- **Build frontend**: `npm run build`.
- **Run backend**: `npm run server`.
