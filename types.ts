export enum Role {
  Product = 'Product',
  Marketing = 'Marketing',
  Management = 'Management',
  Reception = 'Reception',
}

export interface User {
  id: string;
  name: string;
  role: Role;
  username: string; // Tên đăng nhập
  password?: string; // Mật khẩu
}

export type ServiceType = 'single' | 'combo';

export interface Service {
  id: string;
  name: string;
  description: string;
  type: ServiceType;
  category?: string; // Danh mục dịch vụ (VD: RF, Hydrafacial...)
  consultationNote?: string; // Quy trình / Các bước thực hiện
  
  // Pricing Structure
  priceOriginal: number;    // Giá bán gốc
  discountPercent?: number; // Cột Giảm (%) để note
  pricePromo: number;       // Giá KM/Trial
  pricePackage5: number;    // 5 tặng 5 (Promotion Package)
  pricePackage15: number;   // 10 tặng 15 (Promotion Package)
  
  // Session Packages
  pricePackage3: number;        // Gói 3 lần (Was 2)
  pricePackage5Sessions: number; // Gói 5 lần (Distinct from Buy 5 Get 5)
  pricePackage10: number;       // Gói 10 lần
  pricePackage20: number;       // Gói 20 lần
}

export enum PromotionStatus {
  PendingDesign = 'Pending Design',
  PendingApproval = 'Pending Approval',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface PromotionService extends Service {
  discountPrice: number; // The price offered in the specific promotion
  fullPrice: number;     // Snapshot of priceOriginal at the time of promotion
  isCombo?: boolean;     // Ad-hoc combo created within a promotion
}

export interface Promotion {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  services: PromotionService[];
  salesNotes?: string;
  marketingNotes?: string;
  managementNotes?: string;
  designUrl?: string;
  proposerId: string;
  consultationNote?: string; // Custom consultation steps for this specific promotion
}
