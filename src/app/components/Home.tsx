import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { TablesTab } from "./TablesTab";
import { ProductsTab } from "./ProductsTab";
import { CartBar } from "./CartBar";
import { Header } from "./Header";
import { SplashScreen } from "./SplashScreen";
import { productsAPI, tablesAPI, cartAPI } from "../lib/api";
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export interface Table {
  id: string;
  name: string;
  status: "empty" | "active";
  total: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("products");
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load cart when table changes
  useEffect(() => {
    if (selectedTable) {
      loadCart(selectedTable);
      localStorage.setItem("selectedTable", selectedTable);
    } else {
      localStorage.removeItem("selectedTable");
    }
  }, [selectedTable]);

  async function loadData() {
    try {
      const [productsData, tablesData] = await Promise.all([
        productsAPI.getAll(),
        tablesAPI.getAll(),
      ]);
      
      // Initialize demo data if empty
      if (!productsData || productsData.length === 0) {
        await initDemoData();
        // Reload after initialization
        const [newProductsData, newTablesData] = await Promise.all([
          productsAPI.getAll(),
          tablesAPI.getAll(),
        ]);
        setProducts(newProductsData || []);
        setTables(newTablesData || []);
      } else {
        setProducts(productsData || []);
        setTables(tablesData || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function initDemoData() {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-5e6ab4ce/init-demo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      await response.json();
    } catch (error) {
      console.error("Error initializing demo data:", error);
    }
  }

  async function loadCart(tableId: string) {
    try {
      const cartData = await cartAPI.get(tableId);
      setCart(cartData?.items || []);
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  }

  async function saveCart(newCart: CartItem[]) {
    const tableId = selectedTable || "no-table";
    try {
      await cartAPI.save(tableId, newCart);
      setCart(newCart);
      
      // Update table status
      if (selectedTable) {
        setTables(prev => prev.map(t => 
          t.id === selectedTable 
            ? { ...t, status: newCart.length > 0 ? "active" : "empty", total: calculateTotal(newCart) }
            : t
        ));
      }
    } catch (error) {
      console.error("Error saving cart:", error);
      toast.error("Failed to save cart");
    }
  }

  function addToCart(product: Product) {
    const existing = cart.find(item => item.id === product.id);
    
    const newCart = existing
      ? cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }];

    saveCart(newCart);
    toast.success(`${product.name} added to cart`);
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newCart = cart.map(item => 
      item.id === productId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  }

  function removeFromCart(productId: string) {
    const newCart = cart.filter(item => item.id !== productId);
    saveCart(newCart);
  }

  function calculateTotal(items: CartItem[]) {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function handleTableSelect(tableId: string) {
    setSelectedTable(tableId);
    setActiveTab("products");
  }

  const cartTotal = calculateTotal(cart);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <TabsList className="w-full grid grid-cols-2 h-14 bg-transparent p-0 rounded-none">
            <TabsTrigger 
              value="tables" 
              className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-sm h-full"
            >
              <span className="text-base">🪑 Tables</span>
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-sm h-full"
            >
              <span className="text-base">🛍️ Products</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto pb-24">
          <TabsContent value="tables" className="mt-0 p-0">
            <TablesTab 
              tables={tables} 
              onTableSelect={handleTableSelect}
              onRefresh={loadData}
            />
          </TabsContent>

          <TabsContent value="products" className="mt-0 p-0">
            <ProductsTab 
              products={products} 
              cart={cart}
              onAddToCart={addToCart}
              selectedTable={selectedTable}
              onRefresh={loadData}
            />
          </TabsContent>
        </div>
      </Tabs>

      <CartBar 
        count={cartCount}
        total={cartTotal}
        selectedTable={selectedTable}
        tables={tables}
        onTableChange={setSelectedTable}
      />
    </div>
  );
}