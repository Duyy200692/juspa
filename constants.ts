
import { User, Service, Promotion, Role, PromotionStatus } from './types';

// Default users representing the 4 roles
export const USERS: User[] = [
  { id: 'user-sales', name: 'Team Sale', role: Role.Sales, username: 'sale', password: '1' },
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
    pricePromo: Math.round(basePrice * 0.5), // Mock 50% trial
    pricePackage5: basePrice * 5, // Mock buy 5 get 5 (paying for 5)
    pricePackage15: basePrice * 10, // Mock buy 10 get 15 (paying for 10)
});

const FACIAL_SERVICES: Service[] = [
    createService('service-1', 'GeneOX Pro + HA Infusion', 'Sáng mịn bên ngoài, căng mọng từ bên trong', 4500000, 'Bước 1: Tẩy trang & Rửa mặt\nBước 2: GeneoX 3in1 (Massage, Detox, Infusion)\nBước 3: Điện di tinh chất HA\nBước 4: Đắp mặt nạ khóa ẩm'),
    createService('service-2', 'Rf Full Face (Face + Eye)', 'Săn chắc da – trẻ hoá ánh nhìn', 3900000, 'Bước 1: Làm sạch da\nBước 2: Bôi Gel dẫn nhiệt\nBước 3: Đi máy RF vùng mặt (20p)\nBước 4: Đi máy RF vùng mắt (10p)\nBước 5: Lau sạch & Dưỡng da'),
    createService('service-3', 'Crystal Skin Therapy', 'Thanh lọc – tái tạo – cấp ẩm đa tầng', 2500000),
    createService('service-4', 'Bliss & Balance 105’', '45’ Relaxing Hair Wash + 60 JU Signature Massage', 800000),
    createService('service-5', 'Oxy Boots', 'Công nghệ bơm oxy áp lực cao', 1800000),
    createService('service-6', 'Crystal Rejuvenation Journey', '60’ Crystal skin therapy + 60’ JU Signature Massage', 3050000),
];

const HAIR_REMOVAL_SERVICES: Service[] = [
    createService('hr-1', 'Mép trên', 'Triệt lông vùng mép trên', 750000, '1. Cạo lông vùng mép\n2. Bôi Gel lạnh\n3. Bắn laser triệt lông\n4. Vệ sinh và bôi kem dưỡng'),
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
];

export const SERVICES: Service[] = [...FACIAL_SERVICES, ...HAIR_REMOVAL_SERVICES];

export const PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    name: 'Flash Sale Tháng 12',
    startDate: '2025-11-25',
    endDate: '2025-12-15',
    status: PromotionStatus.Approved,
    proposerId: 'user-sales',
    designUrl: 'https://picsum.photos/1080/1920',
    salesNotes: "Chương trình sale cuối năm để kích cầu.",
    marketingNotes: "Design theo tone hồng chủ đạo, nhẹ nhàng.",
    services: [
      { ...SERVICES[0], fullPrice: SERVICES[0].priceOriginal, discountPrice: 2250000 },
      { ...SERVICES[1], fullPrice: SERVICES[1].priceOriginal, discountPrice: 1950000 },
      { ...SERVICES[2], fullPrice: SERVICES[2].priceOriginal, discountPrice: 899000 },
      { ...SERVICES[3], fullPrice: SERVICES[3].priceOriginal, discountPrice: 650000 },
      { ...SERVICES[4], fullPrice: SERVICES[4].priceOriginal, discountPrice: 1600000 },
      { ...SERVICES[5], fullPrice: SERVICES[5].priceOriginal, discountPrice: 1159000 },
    ]
  },
  {
    id: 'promo-2',
    name: 'Đón Hè Rạng Rỡ',
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    status: PromotionStatus.PendingDesign,
    proposerId: 'user-sales',
    salesNotes: "Tập trung vào các dịch vụ làm sáng da và thư giãn.",
    services: [
      { ...SERVICES[0], fullPrice: SERVICES[0].priceOriginal, discountPrice: 3500000 },
      { ...SERVICES[2], fullPrice: SERVICES[2].priceOriginal, discountPrice: 2000000 },
      { ...SERVICES[3], fullPrice: SERVICES[3].priceOriginal, discountPrice: 700000 },
    ]
  },
  {
    id: 'promo-3',
    name: 'Tri Ân Phái Đẹp',
    startDate: '2025-10-10',
    endDate: '2025-10-20',
    status: PromotionStatus.PendingApproval,
    proposerId: 'user-sales',
    designUrl: 'https://picsum.photos/1080/1920',
    salesNotes: "Chương trình cho ngày 20/10.",
    marketingNotes: "Thiết kế đã xong, chờ sếp duyệt.",
    services: [
      { ...SERVICES[4], fullPrice: SERVICES[4].priceOriginal, discountPrice: 1500000 },
      { ...SERVICES[5], fullPrice: SERVICES[5].priceOriginal, discountPrice: 2500000 },
    ]
  }
];
