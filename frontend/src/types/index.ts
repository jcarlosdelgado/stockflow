export type Role = 'ROLE_ADMIN' | 'ROLE_SELLER' | 'ROLE_WAREHOUSEMAN';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  unitOfMeasure: string;
  costPrice: number;
  salePrice: number;
  minStock: number;
  totalStock: number;
  isLowStock: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

export interface WarehouseStockItem {
  stockId: number;
  productId: number;
  productSku: string;
  productName: string;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  quantity: number;
  updatedAt: string;
}

export type MovementType = 'ENTRY' | 'EXIT' | 'TRANSFER' | 'ADJUSTMENT';
export type ReferenceType = 'SALE' | 'PURCHASE' | 'MANUAL_ADJUSTMENT' | 'TRANSFER';

export interface InventoryMovement {
  id: number;
  type: MovementType;
  productId: number;
  productSku: string;
  productName: string;
  warehouseId: number;
  warehouseCode: string;
  warehouseName: string;
  destinationWarehouseId?: number;
  destinationWarehouseCode?: string;
  destinationWarehouseName?: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceType: ReferenceType;
  referenceId: string;
  notes: string;
  createdById: number;
  createdByName: string;
  createdAt: string;
}

export interface Customer {
  id: number;
  documentNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'TRANSFER';
export type SaleStatus = 'COMPLETED' | 'CANCELLED';

export interface SaleItem {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  invoiceNumber: string;
  customerId?: number;
  customerName: string;
  userId: number;
  userName: string;
  warehouseId: number;
  warehouseName: string;
  status: SaleStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  items: SaleItem[];
  createdAt: string;
}

export interface Supplier {
  id: number;
  documentNumber: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

export type PurchaseStatus = 'PENDING' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  productSku: string;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplierCompanyName: string;
  warehouseId: number;
  warehouseName: string;
  status: PurchaseStatus;
  userId: number;
  userName: string;
  totalAmount: number;
  receivedAt?: string;
  notes?: string;
  items: PurchaseOrderItem[];
  createdAt: string;
}

export interface DashboardStats {
  totalActiveProducts: number;
  totalLowStockProducts: number;
  totalWarehouses: number;
  estimatedInventoryValue: number;
  todaySalesTotal: number;
  todaySalesCount: number;
  monthlySalesTotal: number;
  monthlySalesCount: number;
  recentMovements: InventoryMovement[];
}
