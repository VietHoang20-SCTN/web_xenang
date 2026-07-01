const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const categories = [
  { slug: 'xe-nang-dien', name: 'Xe nâng điện', description: 'Giải pháp nâng hạ sạch, tiết kiệm năng lượng cho kho hàng hiện đại.', sortOrder: 1 },
  { slug: 'xe-nang-tay', name: 'Xe nâng tay', description: 'Thiết bị cơ bản, bền bỉ cho vận chuyển pallet trong kho.', sortOrder: 2 },
  { slug: 'xe-nang-dien-dat-lai', name: 'Xe nâng điện dắt lái', description: 'Phù hợp kho hẹp, thao tác nhanh, chi phí vận hành thấp.', sortOrder: 3 },
  { slug: 'xe-nang-dien-dung-lai', name: 'Xe nâng điện đứng lái', description: 'Tối ưu năng suất cho fulfillment, kho lạnh và kho hàng hóa.', sortOrder: 4 }
]

const products = [
  { slug: 'pallet-truck-2t', name: 'Xe nâng tay pallet 2 tấn', categorySlug: 'xe-nang-tay', tag: 'Bán / Cho thuê', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80', summary: 'Dòng xe nâng tay phổ thông cho kho hàng, cửa hàng và khu vực xuất nhập pallet.', specs: ['Tải trọng: 2.000 kg', 'Chiều cao nâng: 200 mm', 'Phù hợp pallet tiêu chuẩn', 'Bảo trì đơn giản'] },
  { slug: 'electric-pallet-stacker', name: 'Xe nâng điện dắt lái 1.5 tấn', categorySlug: 'xe-nang-dien-dat-lai', tag: 'Ưu tiên cho thuê', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80', summary: 'Xe nâng điện dắt lái linh hoạt cho kho hẹp, logistics và fulfillment.', specs: ['Tải trọng: 1.500 kg', 'Chiều cao nâng: 3.000 mm', 'Ắc quy điện', 'Dễ vận hành trong lối đi hẹp'] },
  { slug: 'stand-on-reach-truck', name: 'Xe nâng điện đứng lái reach truck', categorySlug: 'xe-nang-dien-dung-lai', tag: 'Kho lạnh / Logistics', image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=80', summary: 'Thiết bị nâng hạ tối ưu cho kho cao tầng, kho lạnh và trung tâm phân phối.', specs: ['Tải trọng: 1.600 kg', 'Chiều cao nâng: 5.000 mm+', 'Bán kính quay nhỏ', 'Tối ưu năng suất kho'] },
  { slug: 'electric-forklift-3t', name: 'Xe nâng điện 3 tấn', categorySlug: 'xe-nang-dien', tag: 'Bán / Cho thuê dài hạn', image: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=900&q=80', summary: 'Xe nâng điện tải trọng lớn cho nhà kho, nhà máy và khu vực xuất nhập hàng.', specs: ['Tải trọng: 3.000 kg', 'Nhiên liệu: điện', 'Không phát thải tại kho', 'Có gói bảo trì định kỳ'] }
]

const services = [
  { slug: 'cho-thue-xe-nang', title: 'Cho thuê xe nâng', description: 'Gói thuê ngắn hạn, dài hạn cho doanh nghiệp kho vận, logistics và sản xuất.', icon: 'Truck', sortOrder: 1 },
  { slug: 'ban-xe-nang', title: 'Bán xe nâng', description: 'Tư vấn lựa chọn xe nâng điện, xe nâng tay và thiết bị kho phù hợp nhu cầu.', icon: 'PackageCheck', sortOrder: 2 },
  { slug: 'sua-chua-bao-tri', title: 'Sửa chữa & bảo trì', description: 'Kiểm tra, bảo dưỡng, sửa chữa xe nâng và cung cấp phụ tùng thay thế.', icon: 'Settings', sortOrder: 3 },
  { slug: 'tu-van-giai-phap-kho', title: 'Tư vấn giải pháp kho', description: 'Đề xuất cấu hình thiết bị nâng hạ theo layout kho và tần suất vận hành.', icon: 'Factory', sortOrder: 4 }
]

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@xenang.local'
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456'
  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: 'Quản trị viên' }
  })

  await prisma.siteSetting.create({
    data: { brand: 'Xe Nâng Bắc Ninh', hotline: '0900 000 000', zalo: 'https://zalo.me/0900000000', email: 'contact@xenangbacninh.vn', address: 'Bắc Ninh, Việt Nam', mapEmbed: 'https://www.google.com/maps?q=B%E1%BA%AFc%20Ninh%2C%20Vi%E1%BB%87t%20Nam&output=embed' }
  }).catch(async () => {})

  for (const category of categories) {
    await prisma.category.upsert({ where: { slug: category.slug }, update: category, create: category })
  }

  for (const product of products) {
    const category = await prisma.category.findUnique({ where: { slug: product.categorySlug } })
    if (!category) continue
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product, categorySlug: undefined, categoryId: category.id },
      create: { ...product, categorySlug: undefined, categoryId: category.id }
    })
  }

  for (const service of services) {
    await prisma.service.upsert({ where: { slug: service.slug }, update: service, create: service })
  }
}

main().finally(async () => prisma.$disconnect())
