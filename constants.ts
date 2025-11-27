import { User, Service, Promotion, Role, PromotionStatus } from './types';

// Default users representing the 4 roles
export const USERS: User[] = [
  { id: 'user-product', name: 'Team Product', role: Role.Product, username: 'product', password: '1' },
  { id: 'user-mkt', name: 'Team Marketing', role: Role.Marketing, username: 'mkt', password: '1' },
  { id: 'user-boss', name: 'Julie Nguyễn', role: Role.Management, username: 'admin', password: '1' },
  { id: 'user-reception', name: 'Lễ Tân', role: Role.Reception, username: 'reception', password: '1' },
];

// Helper to create mock pricing
const createService = (id: string, name: string, desc: string, basePrice: number, note: string = '', type: 'single' | 'combo' = 'single'): Service => ({
    id,
    name,
    description: desc,
    type,
    consultationNote: note,
    priceOriginal: basePrice,
    // Auto-calculate other prices based on original price for consistency
    pricePromo: Math.round(basePrice * 0.5 / 1000) * 1000, // Trial price ~50%
    pricePackage5: basePrice * 4, // 5 sessions for price of 4
    pricePackage15: basePrice * 8, // 15 sessions for price of 8
});


// DATA FROM USER'S SPREADSHEET IMAGE
export const SERVICES: Service[] = [
  // Combo RF + Hydrafacial
  createService('combo-rf-h-classic', 'RF + Hydrafacial (classic)', '', 6500000, '', 'combo'),
  createService('combo-rf-h-sysnature', 'RF + Hydrafacial (sysnature)', '', 7600000, '', 'combo'),
  createService('combo-rf-h-platinum', 'RF + Hydrafacial (platinum)', '', 9600000, '', 'combo'),
  
  // RF
  createService('rf-mat-matnong', 'RF mặt - mắt/nọng', 'Thời lượng 30 phút', 4500000),
  createService('rf-c+', 'C+', '15 phút', 900000),
  createService('rf-add-vitamin', 'Add Vitamin', '15 phút', 900000),
  createService('rf-mat', 'Mặt', '30 phút', 3900000),
  createService('rf-nong', 'Nọng', '15 phút', 1800000),
  createService('rf-mat-2', 'Mắt', '10 phút', 1500000),
  createService('rf-bap-tay', 'Bắp tay', '30 phút', 2500000),
  createService('rf-dui', 'Đùi', '40 phút', 3000000),
  createService('rf-bap-chuoi', 'Bắp chuối', '30 phút', 3000000),
  createService('rf-bung', 'Bụng', '30 phút', 3500000),
  createService('rf-that-lung-eo', 'Thắt lưng + Eo', '30 phút', 3000000),
  
  // Hydrafacial
  createService('hf-classic', 'Classic', '90 phút', 4600000),
  createService('hf-sysnature', 'Sysnature', '105 phút', 5600000),
  createService('hf-platinum', 'Platinum', '120 phút', 8900000),
  createService('hf-body-lung', 'Body lưng', '45 phút', 5800000),
  createService('hf-body-nguc', 'Body ngực', '45 phút', 5000000),
  createService('hf-3-vung-body', '3 vùng body', '90 phút', 8000000),
  
  // GeneoX Pro
  createService('geneo-rf', 'KO RF', '60 phút', 4500000),
  createService('geneo-acid-neck', 'Acid Neck', '30 phút', 1200000),
  
  // Triệt Lông (từ dữ liệu cũ, giá đã được chuẩn hóa)
  createService('hr-1', 'Mép trên', 'Triệt lông vùng mép trên', 750000, '1. Cạo lông\n2. Bôi Gel lạnh\n3. Bắn laser\n4. Dưỡng da'),
  createService('hr-2', 'Nách/Trán/Cằm', 'Triệt lông vùng nách, trán, hoặc cằm', 950000),
  createService('hr-3', '1/2 Tay', 'Triệt lông 1/2 cánh tay', 1200000),
  createService('hr-4', '1/2 Chân', 'Triệt lông 1/2 chân', 1500000),
  createService('hr-5', 'Toàn mặt', 'Triệt lông toàn bộ mặt', 1800000),
  createService('hr-6', 'Ngực/Bụng', 'Triệt lông vùng ngực hoặc bụng', 1800000),
  createService('hr-7', 'Full tay', 'Triệt lông toàn bộ cánh tay', 1800000),
  createService('hr-8', 'Full chân', 'Triệt lông toàn bộ chân', 2000000),
  createService('hr-9', 'Bikini/Tạo hình', 'Triệt lông và tạo hình vùng bikini', 1800000),
  createService('hr-10', 'Lưng', 'Triệt lông vùng lưng', 2400000),
  createService('hr-11', 'Tay + Chân + Nách', 'Combo triệt lông tay, chân, và nách', 4200000, '', 'combo'),
  createService('hr-12', 'Tay + Chân + Mặt', 'Combo triệt lông tay, chân, và mặt', 4800000, '', 'combo'),
  createService('hr-13', 'Tay + Chân + Bi', 'Combo triệt lông tay, chân, và bikini', 4800000, '', 'combo'),
  createService('hr-14', 'Toàn thân', 'Triệt lông toàn thân', 9600000, '', 'combo'),
  
  // Dịch vụ cũ khác
  createService('service-old-3', 'Crystal Skin Therapy', 'Thanh lọc – tái tạo – cấp ẩm đa tầng', 2500000),
  createService('service-old-4', 'Bliss & Balance 105’', '45’ Relaxing Hair Wash + 60 JU Signature Massage', 800000),
  createService('service-old-5', 'Oxy Boots', 'Công nghệ bơm oxy áp lực cao', 1800000),
];

export const PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    name: 'Flash Sale Tháng 12',
    startDate: '2025-11-25',
    endDate: '2025-12-15',
    status: PromotionStatus.Approved,
    proposerId: 'user-product',
    designUrl: 'https://picsum.photos/1080/1920',
    salesNotes: "Chương trình sale cuối năm để kích cầu.",
    marketingNotes: "Design theo tone hồng chủ đạo, nhẹ nhàng.",
    services: [
      { ...SERVICES[26], fullPrice: SERVICES[26].priceOriginal, discountPrice: 2250000 },
      { ...SERVICES[27], fullPrice: SERVICES[27].priceOriginal, discountPrice: 1950000 },
      { ...SERVICES[28], fullPrice: SERVICES[28].priceOriginal, discountPrice: 899000 },
    ]
  },
  {
    id: 'promo-2',
    name: 'Đón Hè Rạng Rỡ',
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    status: PromotionStatus.PendingDesign,
    proposerId: 'user-product',
    salesNotes: "Tập trung vào các dịch vụ làm sáng da và thư giãn.",
    services: [
      { ...SERVICES[26], fullPrice: SERVICES[26].priceOriginal, discountPrice: 3500000 },
      { ...SERVICES[28], fullPrice: SERVICES[28].priceOriginal, discountPrice: 2000000 },
    ]
  },
  {
    id: 'promo-3',
    name: 'Tri Ân Phái Đẹp',
    startDate: '2025-10-10',
    endDate: '2025-10-20',
    status: PromotionStatus.PendingApproval,
    proposerId: 'user-product',
    designUrl: 'https://picsum.photos/1080/1920',
    salesNotes: "Chương trình cho ngày 20/10.",
    marketingNotes: "Thiết kế đã xong, chờ sếp duyệt.",
    services: [
       { ...SERVICES[30], fullPrice: SERVICES[30].priceOriginal, discountPrice: 1500000 },
    ]
  }
];