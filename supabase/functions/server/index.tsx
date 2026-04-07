import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-5e6ab4ce/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize demo data
app.post("/make-server-5e6ab4ce/init-demo", async (c) => {
  try {
    // Check if already initialized
    const existingProducts = await kv.getByPrefix("product:");
    if (existingProducts.length > 0) {
      return c.json({ success: true, message: "Demo data already exists" });
    }

    // Create demo products
    const demoProducts = [
      { name: "Espresso", price: 80 },
      { name: "Cappuccino", price: 120 },
      { name: "Latte", price: 140 },
      { name: "Cold Coffee", price: 150 },
      { name: "Sandwich", price: 100 },
      { name: "Burger", price: 180 },
      { name: "Pizza Slice", price: 120 },
      { name: "Pasta", price: 200 },
      { name: "Caesar Salad", price: 160 },
      { name: "French Fries", price: 90 },
      { name: "Chocolate Cake", price: 130 },
      { name: "Ice Cream", price: 80 },
    ];

    for (const product of demoProducts) {
      const id = `product:${crypto.randomUUID()}`;
      await kv.set(id, { id, ...product, createdAt: Date.now() });
    }

    // Create demo tables
    const demoTables = [
      "Table 1", "Table 2", "Table 3", "Table 4",
      "Table 5", "Table 6", "Table 7", "Table 8",
    ];

    for (const tableName of demoTables) {
      const id = `table:${crypto.randomUUID()}`;
      await kv.set(id, { 
        id, 
        name: tableName, 
        status: "empty", 
        total: 0, 
        createdAt: Date.now() 
      });
    }

    return c.json({ success: true, message: "Demo data initialized" });
  } catch (error) {
    console.log(`Error initializing demo data: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== PRODUCTS ROUTES ====================
app.get("/make-server-5e6ab4ce/products", async (c) => {
  try {
    const products = await kv.getByPrefix("product:");
    return c.json({ success: true, data: products });
  } catch (error) {
    console.log(`Error fetching products: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-5e6ab4ce/products", async (c) => {
  try {
    const body = await c.req.json();
    const { name, price, image } = body;
    
    if (!name || price === undefined) {
      return c.json({ success: false, error: "Name and price are required" }, 400);
    }

    const id = `product:${crypto.randomUUID()}`;
    const product = { id, name, price: Number(price), image, createdAt: Date.now() };
    
    await kv.set(id, product);
    return c.json({ success: true, data: product });
  } catch (error) {
    console.log(`Error creating product: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-5e6ab4ce/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const { name, price, image } = body;

    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: "Product not found" }, 404);
    }

    const updated = { 
      ...existing, 
      name: name ?? existing.name, 
      price: price !== undefined ? Number(price) : existing.price,
      image: image !== undefined ? image : existing.image,
      updatedAt: Date.now() 
    };
    
    await kv.set(id, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log(`Error updating product: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-5e6ab4ce/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await kv.del(id);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting product: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== TABLES ROUTES ====================
app.get("/make-server-5e6ab4ce/tables", async (c) => {
  try {
    const tables = await kv.getByPrefix("table:");
    return c.json({ success: true, data: tables });
  } catch (error) {
    console.log(`Error fetching tables: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-5e6ab4ce/tables", async (c) => {
  try {
    const body = await c.req.json();
    const { name } = body;
    
    if (!name) {
      return c.json({ success: false, error: "Name is required" }, 400);
    }

    const id = `table:${crypto.randomUUID()}`;
    const table = { id, name, status: "empty", total: 0, createdAt: Date.now() };
    
    await kv.set(id, table);
    return c.json({ success: true, data: table });
  } catch (error) {
    console.log(`Error creating table: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.put("/make-server-5e6ab4ce/tables/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ success: false, error: "Table not found" }, 404);
    }

    const updated = { ...existing, ...body, updatedAt: Date.now() };
    await kv.set(id, updated);
    return c.json({ success: true, data: updated });
  } catch (error) {
    console.log(`Error updating table: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-5e6ab4ce/tables/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    // Also delete associated cart
    const cartId = `cart:${id}`;
    await kv.del(cartId);
    await kv.del(id);
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting table: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CART ROUTES ====================
app.get("/make-server-5e6ab4ce/cart/:tableId", async (c) => {
  try {
    const tableId = c.req.param("tableId");
    const cartId = `cart:${tableId}`;
    const cart = await kv.get(cartId) || { items: [], total: 0 };
    return c.json({ success: true, data: cart });
  } catch (error) {
    console.log(`Error fetching cart: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-5e6ab4ce/cart/:tableId", async (c) => {
  try {
    const tableId = c.req.param("tableId");
    const body = await c.req.json();
    const { items } = body;

    const cartId = `cart:${tableId}`;
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const cart = { items, total, updatedAt: Date.now() };
    
    await kv.set(cartId, cart);

    // Update table status
    if (tableId !== "no-table") {
      const table = await kv.get(tableId);
      if (table) {
        await kv.set(tableId, { 
          ...table, 
          status: items.length > 0 ? "active" : "empty", 
          total,
          updatedAt: Date.now() 
        });
      }
    }

    return c.json({ success: true, data: cart });
  } catch (error) {
    console.log(`Error saving cart: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.delete("/make-server-5e6ab4ce/cart/:tableId", async (c) => {
  try {
    const tableId = c.req.param("tableId");
    const cartId = `cart:${tableId}`;
    await kv.del(cartId);

    // Update table status
    if (tableId !== "no-table") {
      const table = await kv.get(tableId);
      if (table) {
        await kv.set(tableId, { ...table, status: "empty", total: 0, updatedAt: Date.now() });
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Error clearing cart: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== ORDERS ROUTES ====================
app.post("/make-server-5e6ab4ce/orders", async (c) => {
  try {
    const body = await c.req.json();
    const { tableId, items, total, customer, discount } = body;

    const orderId = `order:${crypto.randomUUID()}`;
    const order = {
      id: orderId,
      tableId,
      items,
      total,
      discount: discount || 0,
      customer: customer || null,
      status: "completed",
      createdAt: Date.now(),
    };

    await kv.set(orderId, order);

    // Clear cart after order
    if (tableId && tableId !== "no-table") {
      const cartId = `cart:${tableId}`;
      await kv.del(cartId);

      // Update table
      const table = await kv.get(tableId);
      if (table) {
        await kv.set(tableId, { ...table, status: "empty", total: 0, updatedAt: Date.now() });
      }
    }

    return c.json({ success: true, data: order });
  } catch (error) {
    console.log(`Error creating order: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-5e6ab4ce/orders", async (c) => {
  try {
    const orders = await kv.getByPrefix("order:");
    // Sort by date descending
    orders.sort((a: any, b: any) => b.createdAt - a.createdAt);
    return c.json({ success: true, data: orders });
  } catch (error) {
    console.log(`Error fetching orders: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== CUSTOMERS ROUTES ====================
app.post("/make-server-5e6ab4ce/customers", async (c) => {
  try {
    const body = await c.req.json();
    const { email, phone, name } = body;

    if (!email && !phone) {
      return c.json({ success: false, error: "Email or phone is required" }, 400);
    }

    const customerId = `customer:${email || phone}`;
    const customer = { id: customerId, email, phone, name, createdAt: Date.now() };
    
    await kv.set(customerId, customer);
    return c.json({ success: true, data: customer });
  } catch (error) {
    console.log(`Error saving customer: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-5e6ab4ce/customers", async (c) => {
  try {
    const customers = await kv.getByPrefix("customer:");
    return c.json({ success: true, data: customers });
  } catch (error) {
    console.log(`Error fetching customers: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== SETTINGS ROUTES ====================
app.get("/make-server-5e6ab4ce/settings", async (c) => {
  try {
    const settings = await kv.get("settings") || {
      businessName: "FlowPOS",
      autoSendInvoice: true,
      currency: "₹",
      taxRate: 0,
    };
    return c.json({ success: true, data: settings });
  } catch (error) {
    console.log(`Error fetching settings: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.post("/make-server-5e6ab4ce/settings", async (c) => {
  try {
    const body = await c.req.json();
    await kv.set("settings", { ...body, updatedAt: Date.now() });
    return c.json({ success: true, data: body });
  } catch (error) {
    console.log(`Error saving settings: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);