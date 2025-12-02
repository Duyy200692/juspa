export enum Role {
  Product = 'Product',
  Marketing = 'Marketing',
  Management = 'Management',
  Reception = 'Reception',
  Accountant = 'Accountant', // New Role
}

export interface User {
  id: string;
  name: string;
  role: Role;
  username: string;
  password?: string;
}

export type ServiceType = 'single' | 'combo';

export interface Service {
  id: string;
  name: string;
  description: string;
  type: ServiceType;
  category?: string;
  consultationNote?: string;
  
  priceOriginal: number;
  discountPercent?: number;
  pricePromo: number;
  pricePackage5: number;
  pricePackage15: number;
  
  pricePackage3: number;
  pricePackage5Sessions: number;
  pricePackage10: number;
  pricePackage20: number;
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
  consultationNote?: string;
}

// --- INVENTORY TYPES ---

export interface InventoryItem {
  id: string;
  name: string;
  unit: string; // cái, hộp, chai, ml...
  quantity: number;
  location: string; // Kệ A, Kệ B...
  expiryDate?: string; // YYYY-MM-DD
  minThreshold?: number; // Cảnh báo sắp hết hàng
  notes?: string;
}

export type TransactionType = 'in' | 'out';

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  date: string; // ISO string
  performedBy: string; // User Name
  performedById: string; // User ID
  reason?: string; // e.g., "Khách dùng", "Hư hỏng", "Nhập hàng mới"
  remainingStock: number;
}