# Tài liệu hệ thống Website Xe Nâng Bắc Ninh

Tài liệu vận hành hiện hành nằm trong `README.md`. Kiến trúc chuẩn: React/Vite tại `client/`, Express tại `server/`, MySQL/MariaDB qua Prisma, ảnh lưu Cloudinary, xác thực admin bằng JWT trong HttpOnly cookie.

Nguồn chuẩn database: `server/prisma/schema.prisma` và `server/prisma/migrations/`. Không chỉnh schema bằng file SQL dump.

Các endpoint, biến môi trường, lệnh local/production, kiểm thử và checklist nghiệm thu được duy trì tại `README.md` để tránh hai tài liệu sai lệch.
