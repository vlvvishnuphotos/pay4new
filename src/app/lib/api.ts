// API configuration and functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Products API
export const productsAPI = {
  getProducts: () => fetchWithAuth('/products'),
  getProduct: (id: string) => fetchWithAuth(`/products/${id}`),
  createProduct: (product: any) => fetchWithAuth('/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id: string, data: any) => fetchWithAuth(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => fetchWithAuth(`/products/${id}`, { method: 'DELETE' }),
  getProductsByCategory: (categoryId: string) => fetchWithAuth(`/products?category=${categoryId}`),
  searchProducts: (query: string) => fetchWithAuth(`/products/search?q=${query}`),
};

// Cart API
export const cartAPI = {
  getCart: () => fetchWithAuth('/cart'),
  addToCart: (item: any) => fetchWithAuth('/cart', { method: 'POST', body: JSON.stringify(item) }),
  updateCartItem: (id: string, quantity: number) => fetchWithAuth(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeFromCart: (id: string) => fetchWithAuth(`/cart/${id}`, { method: 'DELETE' }),
  clearCart: () => fetchWithAuth('/cart/clear', { method: 'DELETE' }),
};

// Orders API
export const ordersAPI = {
  getOrders: () => fetchWithAuth('/orders'),
  getOrder: (id: string) => fetchWithAuth(`/orders/${id}`),
  createOrder: (order: any) => fetchWithAuth('/orders', { method: 'POST', body: JSON.stringify(order) }),
  updateOrder: (id: string, data: any) => fetchWithAuth(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  cancelOrder: (id: string) => fetchWithAuth(`/orders/${id}/cancel`, { method: 'POST' }),
};

// Customers API
export const customersAPI = {
  getCustomers: () => fetchWithAuth('/customers'),
  getCustomer: (id: string) => fetchWithAuth(`/customers/${id}`),
  createCustomer: (customer: any) => fetchWithAuth('/customers', { method: 'POST', body: JSON.stringify(customer) }),
  updateCustomer: (id: string, data: any) => fetchWithAuth(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: string) => fetchWithAuth(`/customers/${id}`, { method: 'DELETE' }),
  getCustomerOrders: (id: string) => fetchWithAuth(`/customers/${id}/orders`),
};

// Settings API
export const settingsAPI = {
  getSettings: () => fetchWithAuth('/settings'),
  updateSettings: (settings: any) => fetchWithAuth('/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  getPaymentSettings: () => fetchWithAuth('/settings/payment'),
  updatePaymentSettings: (settings: any) => fetchWithAuth('/settings/payment', { method: 'PUT', body: JSON.stringify(settings) }),
};

// Tables API
export const tablesAPI = {
  getTables: () => fetchWithAuth('/tables'),
  getTable: (id: string) => fetchWithAuth(`/tables/${id}`),
  createTable: (table: any) => fetchWithAuth('/tables', { method: 'POST', body: JSON.stringify(table) }),
  updateTable: (id: string, data: any) => fetchWithAuth(`/tables/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTable: (id: string) => fetchWithAuth(`/tables/${id}`, { method: 'DELETE' }),
  updateTableStatus: (id: string, status: string) => fetchWithAuth(`/tables/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  reserveTable: (id: string, reservation: any) => fetchWithAuth(`/tables/${id}/reserve`, { method: 'POST', body: JSON.stringify(reservation) }),
};

export default {
  productsAPI,
  cartAPI,
  ordersAPI,
  customersAPI,
  settingsAPI,
  tablesAPI,
};