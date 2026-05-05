export const categories = [
  { id: 'xe-nang-dien', name: 'Xe nâng điện', description: 'Giải pháp nâng hạ sạch, tiết kiệm năng lượng cho kho hàng hiện đại.' },
  { id: 'xe-nang-tay', name: 'Xe nâng tay', description: 'Thiết bị cơ bản, bền bỉ cho vận chuyển pallet trong kho.' },
  { id: 'xe-nang-dien-dat-lai', name: 'Xe nâng điện dắt lái', description: 'Phù hợp kho hẹp, thao tác nhanh, chi phí vận hành thấp.' },
  { id: 'xe-nang-dien-dung-lai', name: 'Xe nâng điện đứng lái', description: 'Tối ưu năng suất cho fulfillment, kho lạnh và kho hàng hóa.' }
]

export const products = [
  {
    id: 'pallet-truck-2t',
    name: 'Xe nâng tay pallet 2 tấn',
    categoryId: 'xe-nang-tay',
    tag: 'Bán / Cho thuê',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80',
    summary: 'Dòng xe nâng tay phổ thông cho kho hàng, cửa hàng và khu vực xuất nhập pallet.',
    specs: ['Tải trọng: 2.000 kg', 'Chiều cao nâng: 200 mm', 'Phù hợp pallet tiêu chuẩn', 'Bảo trì đơn giản']
  },
  {
    id: 'electric-pallet-stacker',
    name: 'Xe nâng điện dắt lái 1.5 tấn',
    categoryId: 'xe-nang-dien-dat-lai',
    tag: 'Ưu tiên cho thuê',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80',
    summary: 'Xe nâng điện dắt lái linh hoạt cho kho hẹp, logistics và fulfillment.',
    specs: ['Tải trọng: 1.500 kg', 'Chiều cao nâng: 3.000 mm', 'Ắc quy điện', 'Dễ vận hành trong lối đi hẹp']
  },
  {
    id: 'stand-on-reach-truck',
    name: 'Xe nâng điện đứng lái reach truck',
    categoryId: 'xe-nang-dien-dung-lai',
    tag: 'Kho lạnh / Logistics',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=80',
    summary: 'Thiết bị nâng hạ tối ưu cho kho cao tầng, kho lạnh và trung tâm phân phối.',
    specs: ['Tải trọng: 1.600 kg', 'Chiều cao nâng: 5.000 mm+', 'Bán kính quay nhỏ', 'Tối ưu năng suất kho']
  },
  {
    id: 'electric-forklift-3t',
    name: 'Xe nâng điện 3 tấn',
    categoryId: 'xe-nang-dien',
    tag: 'Bán / Cho thuê dài hạn',
    image: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&w=900&q=80',
    summary: 'Xe nâng điện tải trọng lớn cho nhà kho, nhà máy và khu vực xuất nhập hàng.',
    specs: ['Tải trọng: 3.000 kg', 'Nhiên liệu: điện', 'Không phát thải tại kho', 'Có gói bảo trì định kỳ']
  }
]

export const services = [
  { title: 'Cho thuê xe nâng', description: 'Gói thuê ngắn hạn, dài hạn cho doanh nghiệp kho vận, logistics và sản xuất.' },
  { title: 'Bán xe nâng', description: 'Tư vấn lựa chọn xe nâng điện, xe nâng tay và thiết bị kho phù hợp nhu cầu.' },
  { title: 'Sửa chữa & bảo trì', description: 'Kiểm tra, bảo dưỡng, sửa chữa xe nâng và cung cấp phụ tùng thay thế.' },
  { title: 'Tư vấn giải pháp kho', description: 'Đề xuất cấu hình thiết bị nâng hạ theo layout kho và tần suất vận hành.' }
]

export const leads = [
  { name: 'Công ty Logistics miền Bắc', phone: '09xx xxx xxx', need: 'Thuê xe nâng điện dắt lái', status: 'Mới' },
  { name: 'Kho lạnh Bắc Ninh', phone: '08xx xxx xxx', need: 'Báo giá reach truck', status: 'Đang tư vấn' }
]

export const siteSettings = {
  brand: 'Xe Nâng Bắc Ninh',
  hotline: '0900 000 000',
  zalo: 'https://zalo.me/0900000000',
  address: 'Bắc Ninh, Việt Nam',
  email: 'contact@xenangbacninh.vn',
  mapEmbed: 'https://www.google.com/maps?q=B%E1%BA%AFc%20Ninh%2C%20Vi%E1%BB%87t%20Nam&output=embed'
}
