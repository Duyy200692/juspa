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
  fullPrice: number; // The original price for this promotion item, copied from pricePerSession
  isCombo?: boolean;
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