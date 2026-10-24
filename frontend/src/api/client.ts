import {
  ApiResponse,
  AuthResponse,
  Category,
  Customer,
  DashboardStats,
  InventoryMovement,
  MovementType,
  PagedResponse,
  PaymentMethod,
  Product,
  PurchaseOrder,
  PurchaseStatus,
  Role,
  Sale,
  Supplier,
  User,
  Warehouse,
  WarehouseStockItem,
} from '../types';

const BASE_URL = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('stockflow_token');
  const headers = new Headers(options.headers || {});

  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('stockflow_token');
    localStorage.removeItem('stockflow_user');
    window.dispatchEvent(new Event('stockflow_logout'));
  }

  const json: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: 'Error de comunicación con el servidor',
    data: null as unknown as T,
    timestamp: new Date().toISOString(),
  }));

  if (!response.ok || !json.success) {
    throw new Error(json.message || `Error del servidor (${response.status})`);
  }

  return json.data;
}

// 1. Auth API
export const authApi = {
  login: (usernameOrEmail: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usernameOrEmail, password }),
    }),
  getMe: () => request<User>('/auth/me'),
};

// 2. Dashboard API
export const dashboardApi = {
  getStats: () => request<DashboardStats>('/dashboard/stats'),
};

// 3. Products API
export const productsApi = {
  getProducts: (params?: { categoryId?: number; activeOnly?: boolean; search?: string; page?: number; size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId.toString());
    if (params?.activeOnly !== undefined) searchParams.set('activeOnly', params.activeOnly.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page !== undefined) searchParams.set('page', params.page.toString());
    if (params?.size !== undefined) searchParams.set('size', params.size.toString());
    return request<PagedResponse<Product>>(`/products?${searchParams.toString()}`);
  },
  getById: (id: number) => request<Product>(`/products/${id}`),
  create: (data: Partial<Product>) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Product>) =>
    request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deactivate: (id: number) =>
    request<void>(`/products/${id}`, {
      method: 'DELETE',
    }),
  activate: (id: number) =>
    request<void>(`/products/${id}/activate`, {
      method: 'PATCH',
    }),
};

// 4. Categories API
export const categoriesApi = {
  getAll: (onlyActive = false) => request<Category[]>(`/categories?onlyActive=${onlyActive}`),
  create: (data: { name: string; description?: string }) =>
    request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { name: string; description?: string; isActive?: boolean }) =>
    request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// 5. Warehouses API
export const warehousesApi = {
  getAll: (onlyActive = false) => request<Warehouse[]>(`/warehouses?onlyActive=${onlyActive}`),
  getById: (id: number) => request<Warehouse>(`/warehouses/${id}`),
  getWarehouseStocks: (id: number) => request<WarehouseStockItem[]>(`/warehouses/${id}/stocks`),
  getProductStocks: (productId: number) => request<WarehouseStockItem[]>(`/warehouses/products/${productId}/stocks`),
  create: (data: { code: string; name: string; address?: string }) =>
    request<Warehouse>('/warehouses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: { code: string; name: string; address?: string; isActive?: boolean }) =>
    request<Warehouse>(`/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// 6. Inventory API
export const inventoryApi = {
  getMovements: (params?: { productId?: number; warehouseId?: number; type?: MovementType; page?: number; size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.productId) searchParams.set('productId', params.productId.toString());
    if (params?.warehouseId) searchParams.set('warehouseId', params.warehouseId.toString());
    if (params?.type) searchParams.set('type', params.type);
    if (params?.page !== undefined) searchParams.set('page', params.page.toString());
    if (params?.size !== undefined) searchParams.set('size', params.size.toString());
    return request<PagedResponse<InventoryMovement>>(`/inventory/movements?${searchParams.toString()}`);
  },
  adjustStock: (data: { productId: number; warehouseId: number; type: MovementType; quantity: number; notes?: string }) =>
    request<InventoryMovement>('/inventory/adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  transferStock: (data: { productId: number; sourceWarehouseId: number; destinationWarehouseId: number; quantity: number; notes?: string }) =>
    request<InventoryMovement>('/inventory/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// 7. Sales API
export const salesApi = {
  getAll: (params?: { warehouseId?: number; page?: number; size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.warehouseId) searchParams.set('warehouseId', params.warehouseId.toString());
    if (params?.page !== undefined) searchParams.set('page', params.page.toString());
    if (params?.size !== undefined) searchParams.set('size', params.size.toString());
    return request<PagedResponse<Sale>>(`/sales?${searchParams.toString()}`);
  },
  getById: (id: number) => request<Sale>(`/sales/${id}`),
  createSale: (data: {
    customerId?: number;
    warehouseId: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    items: { productId: number; quantity: number }[];
  }) =>
    request<Sale>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCustomers: () => request<Customer[]>('/customers'),
  createCustomer: (data: { documentNumber?: string; name: string; email?: string; phone?: string; address?: string }) =>
    request<Customer>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// 8. Purchases API
export const purchasesApi = {
  getAll: (params?: { status?: PurchaseStatus; warehouseId?: number; page?: number; size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.warehouseId) searchParams.set('warehouseId', params.warehouseId.toString());
    if (params?.page !== undefined) searchParams.set('page', params.page.toString());
    if (params?.size !== undefined) searchParams.set('size', params.size.toString());
    return request<PagedResponse<PurchaseOrder>>(`/purchases?${searchParams.toString()}`);
  },
  getById: (id: number) => request<PurchaseOrder>(`/purchases/${id}`),
  createOrder: (data: {
    supplierId: number;
    warehouseId: number;
    notes?: string;
    items: { productId: number; quantity: number; unitCost: number }[];
  }) =>
    request<PurchaseOrder>('/purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  receiveOrder: (id: number) =>
    request<PurchaseOrder>(`/purchases/${id}/receive`, {
      method: 'PATCH',
    }),
  getSuppliers: (onlyActive = false) => request<Supplier[]>(`/suppliers?onlyActive=${onlyActive}`),
  createSupplier: (data: { documentNumber?: string; companyName: string; contactName?: string; email?: string; phone?: string; address?: string }) =>
    request<Supplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// 9. Users API
export const usersApi = {
  getAll: () => request<User[]>('/users'),
  toggleStatus: (id: number, active: boolean) =>
    request<User>(`/users/${id}/status?active=${active}`, {
      method: 'PATCH',
    }),
  updateRole: (id: number, role: Role) =>
    request<User>(`/users/${id}/role?role=${role}`, {
      method: 'PATCH',
    }),
};
