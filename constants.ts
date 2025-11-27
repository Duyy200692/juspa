import { User, Service, Promotion, Role, PromotionStatus } from './types';

export const USERS: User[] = [
  { id: 'user-1', name: 'Loan (Lễ tân)', role: Role.Reception },
  { id: 'user-2', name: 'Minh (Sale)', role: Role.Sales },
  { id: 'user-3', name: 'Hà (Marketing)', role: Role.Marketing },
  { id: 'user-4', name: 'Anh Tuấn (Sếp)', role: Role.Management },
];

const FACIAL_SERVICES: Service[] = [
    { id: 'service-1', name: 'GeneOX Pro + HA Infusion', description: 'Sáng mịn bên ngoài, căng mọng từ bên trong', pricePerSession: 4500000, priceFullPackage: 36000000 },
    { id: 'service-2', name: 'Rf Full Face (Face + Eye)', description: 'Săn chắc da – trẻ hoá ánh nhìn', pricePerSession: 3900000, priceFullPackage: 31200000 },
    { id: 'service-3', name: 'Crystal Skin Therapy', description: 'Thanh lọc – tái tạo – cấp ẩm đa tầng', pricePerSession: 2500000, priceFullPackage: 20000000 },
    { id: 'service-4', name: 'Bliss & Balance 105’', description: '45’ Relaxing Hair Wash + 60 JU Signature Massage', pricePerSession: 800000, priceFullPackage: 6400000 },
    { id: 'service-5', name: 'Oxy Boots', description: 'Công nghệ bơm oxy áp lực cao', pricePerSession: 1800000, priceFullPackage: 14400000 },
    { id: 'service-6', name: 'Crystal Rejuvenation Journey', description: '60’ Crystal skin therapy + 60’ JU Signature Massage', pricePerSession: 3050000, priceFullPackage: 24400000 },
];

const HAIR_REMOVAL_SERVICES: Service[] = [
    { id: 'hr-1', name: 'Mép trên', description: 'Triệt lông vùng mép trên', pricePerSession: 750000, priceFullPackage: 4400000 },
    { id: 'hr-2', name: 'Nách/Trán/Cằm', description: 'Triệt lông vùng nách, trán, hoặc cằm', pricePerSession: 950000, priceFullPackage: 5800000 },
    { id: 'hr-3', name: '1/2 Tay', description: 'Triệt lông 1/2 cánh tay', pricePerSession: 1200000, priceFullPackage: 7200000 },
    { id: 'hr-4', name: '1/2 Chân', description: 'Triệt lông 1/2 chân', pricePerSession: 1500000, priceFullPackage: 8700000 },
    { id: 'hr-5', name: 'Toàn mặt', description: 'Triệt lông toàn bộ mặt', pricePerSession: 1800000, priceFullPackage: 11000000 },
    { id: 'hr-6', name: 'Ngực/Bụng', description: 'Triệt lông vùng ngực hoặc bụng', pricePerSession: 1800000, priceFullPackage: 11000000 },
    { id: 'hr-7', name: 'Full tay', description: 'Triệt lông toàn bộ cánh tay', pricePerSession: 1800000, priceFullPackage: 11000000 },
    { id: 'hr-8', name: 'Full chân', description: 'Triệt lông toàn bộ chân', pricePerSession: 2000000, priceFullPackage: 12500000 },
    { id: 'hr-9', name: 'Bikini/Tạo hình', description: 'Triệt lông và tạo hình vùng bikini', pricePerSession: 1800000, priceFullPackage: 11000000 },
    { id: 'hr-10', name: 'Lưng', description: 'Triệt lông vùng lưng', pricePerSession: 2400000, priceFullPackage: 14500000 },
    { id: 'hr-11', name: 'Tay + Chân + Nách', description: 'Combo triệt lông tay, chân, và nách', pricePerSession: 4200000, priceFullPackage: 25000000 },
    { id: 'hr-12', name: 'Tay + Chân + Mặt', description: 'Combo triệt lông tay, chân, và mặt', pricePerSession: 4800000, priceFullPackage: 29000000 },
    { id: 'hr-13', name: 'Tay + Chân + Bi', description: 'Combo triệt lông tay, chân, và bikini', pricePerSession: 4800000, priceFullPackage: 29000000 },
    { id: 'hr-14', name: 'Toàn thân', description: 'Triệt lông toàn thân', pricePerSession: 9600000, priceFullPackage: 57500000 },
];


export const SERVICES: Service[] = [...FACIAL_SERVICES, ...HAIR_REMOVAL_SERVICES];

export const PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    name: 'Flash Sale Tháng 12',
    startDate: '2025-11-25',
    endDate: '2025-12-15',
    status: PromotionStatus.Approved,
    proposerId: 'user-2',
    designUrl: 'https://picsum.photos/1080/1920',
    salesNotes: "Chương trình sale cuối năm để kích cầu.",
    marketingNotes: "Design theo tone hồng chủ đạo, nhẹ nhàng.",
    services: [
      { ...SERVICES[0], fullPrice: SERVICES[0].pricePerSession, discountPrice: 2250000 },
      { ...SERVICES[1], fullPrice: SERVICES[1].pricePerSession, discountPrice: 1950000 },
      { ...SERVICES[2], fullPrice: SERVICES[2].pricePerSession, discountPrice: 899000 },
      { ...SERVICES[3], fullPrice: SERVICES[3].pricePerSession, discountPrice: 650000 },
      { ...SERVICES[4], fullPrice: SERVICES[4].pricePerSession, discountPrice: 1600000 },
      { ...SERVICES[5], fullPrice: SERVICES[5].pricePerSession, discountPrice: 1159000 },
    ]
  },
  {
    id: 'promo-2',
    name: 'Đón Hè Rạng Rỡ',
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    status: PromotionStatus.PendingDesign,
    proposerId: 'user-2',
    salesNotes: "Tập trung vào các dịch vụ làm sáng da và thư giãn.",
    services: [
      { ...SERVICES[0], fullPrice: SERVICES[0].pricePerSession, discountPrice: 3500000 },
      { ...SERVICES[2], fullPrice: SERVICES[2].pricePerSession, discountPrice: 2000000 },
      { ...SERVICES[3], fullPrice: SERVICES[3].pricePerSession, discountPrice: 700000 },
    ]
  },
  {
    id: 'promo-3',
    name: 'Tri Ân Phái Đẹp',
    startDate: '2025-10-10',
    endDate: '2025-10-20',
    status: PromotionStatus.PendingApproval,
    proposerId: 'user-2',
    designUrl: 'https://picsum.photos/1080/1920',
    salesNotes: "Chương trình cho ngày 20/10.",
    marketingNotes: "Thiết kế đã xong, chờ sếp duyệt.",
    services: [
      { ...SERVICES[4], fullPrice: SERVICES[4].pricePerSession, discountPrice: 1500000 },
      { ...SERVICES[5], fullPrice: SERVICES[5].pricePerSession, discountPrice: 2500000 },
    ]
  }
];