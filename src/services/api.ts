// src/services/api.ts

const API_BASE = "https://your-deno-deploy-url.com/make-server-5e6ab4ce";

// ⚠️ IMPORTANT: Replace the URL above with your actual Deno deployment URL
// Once you deploy your backend to Deno, update this URL

// ==================== PRODUCTS ====================
export const getProducts = async () => {
  const res = await fetch(`${API_BASE}/products`);
  const data = await res.json();
  return data.data || [];
};

export const addProduct = async (product: { name: string; price: number; image?: string }) => {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  return data.data;
};

export const updateProduct = async (id: string, product: { name?: string; price?: number; image?: string }) => {
  const res = await fetch(`${API_BASE}/products/${id.replace('product:', '')}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  const data = await res.json();
  return data.data;
};

export const deleteProduct = async (id: string) => {
  const res = await fetch(`${API_BASE}/products/${id.replace('product:', '')}`, {
    method: "DELETE",
  });
  return res.json();
};

// ==================== TABLES ====================
export const getTables = async () => {
  const res = await fetch(`${API_BASE}/tables`);
  const data = await res.json();
  return data.data || [];
};

export const addTable = async (name: string) => {
  const res = await fetch(`${API_BASE}/tables`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  return data.data;
};

export const updateTable = async (id: string, data: { name?: string; status?: string; total?: number }) => {
  const res = await fetch(`${API_BASE}/tables/${id.replace('table:', '')}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const data_res = await res.json();
  return data_res.data;
};

export const deleteTable = async (id: string) => {
  const res = await fetch(`${API_BASE}/tables/${id.replace('table:', '')}`, {
    method: "DELETE",
  });
  return res.json();
};

// ==================== CART ====================
export const getCart = async (tableId: string) => {
  const res = await fetch(`${API_BASE}/cart/${tableId.replace('table:', '')}`);
  const data = await res.json();
  return data.data || { items: [], total: 0 };
};

export const saveCart = async (tableId: string, items: any[]) => {
  const res = await fetch(`${API_BASE}/cart/${tableId.replace('table:', '')}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const data = await res.json();
  return data.data;
};

export const clearCart = async (tableId: string) => {
  const res = await fetch(`${API_BASE}/cart/${tableId.replace('table:', '')}`, {
    method: "DELETE",
  });
  return res.json();
};

// ==================== ORDERS ====================
export const createOrder = async (order: { tableId: string; items: any[]; total: number; customer?: any; discount?: number }) => {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  const data = await res.json();
  return data.data;
};

export const getOrders = async () => {
  const res = await fetch(`${API_BASE}/orders`);
  const data = await res.json();
  return data.data || [];
};

// ==================== INITIALIZE DEMO ====================
export const initDemo = async () => {
  const res = await fetch(`${API_BASE}/init-demo`, {
    method: "POST",
  });
  const data = await res.json();
  return data;
};

// ==================== CUSTOMERS ====================
export const getCustomers = async () => {
  const res = await fetch(`${API_BASE}/customers`);
  const data = await res.json();
  return data.data || [];
};

export const addCustomer = async (customer: { email?: string; phone?: string; name?: string }) => {
  const res = await fetch(`${API_BASE}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });
  const data = await res.json();
  return data.data;
};

// ==================== SETTINGS ====================
export const getSettings = async () => {
  const res = await fetch(`${API_BASE}/settings`);
  const data = await res.json();
  return data.data;
};

export const updateSettings = async (settings: any) => {
  const res = await fetch(`${API_BASE}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  const data = await res.json();
  return data.data;
};