
export enum Role {
  Sales = 'Sales',
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

export interface Service {
  id: string;
  name: string;
  description: string;
  pricePerSession: number;
  priceFullPackage: number;
}

export enum PromotionStatus {
  PendingDesign = 'Pending Design',
  PendingApproval = 'Pending Approval',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface PromotionService extends Service {
  discountPrice: number;
  fullPrice: number; 
  isCombo?: boolean; // Đánh dấu nếu đây là gói combo
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
}
