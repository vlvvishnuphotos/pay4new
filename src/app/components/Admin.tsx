import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Plus, Pencil, Trash2, Package, Store } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { productsAPI, tablesAPI, settingsAPI } from "../lib/api";
import { toast } from "sonner";

export function Admin() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [productDialog, setProductDialog] = useState<{ open: boolean; product: any | null }>({ open: false, product: null });
  const [tableDialog, setTableDialog] = useState<{ open: boolean; table: any | null }>({ open: false, table: null });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [productsData, tablesData, settingsData] = await Promise.all([
        productsAPI.getAll(),
        tablesAPI.getAll(),
        settingsAPI.get(),
      ]);
      setProducts(productsData || []);
      setTables(tablesData || []);
      setSettings(settingsData);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProduct(product: any) {
    try {
      if (product.id) {
        await productsAPI.update(product.id, product);
        toast.success("Product updated");
      } else {
        await productsAPI.create(product);
        toast.success("Product created");
      }
      setProductDialog({ open: false, product: null });
      loadData();
    } catch (error) {
      toast.error("Failed to save product");
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await productsAPI.delete(id);
      toast.success("Product deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  }

  async function handleSaveTable(table: any) {
    try {
      if (table.id) {
        await tablesAPI.update(table.id, table);
        toast.success("Table updated");
      } else {
        await tablesAPI.create(table);
        toast.success("Table created");
      }
      setTableDialog({ open: false, table: null });
      loadData();
    } catch (error) {
      toast.error("Failed to save table");
    }
  }

  async function handleDeleteTable(id: string) {
    if (!confirm("Are you sure you want to delete this table?")) return;
    
    try {
      await tablesAPI.delete(id);
      toast.success("Table deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete table");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border"
      >
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage products & tables</p>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="products" className="p-4">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Button
            onClick={() => setProductDialog({ open: true, product: null })}
            className="w-full rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>

          <div className="space-y-3">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border-2 border-border p-4 flex items-center gap-4"
              >
                <Package className="h-10 w-10 text-muted-foreground" />
                <div className="flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-emerald-600 font-bold">₹{product.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setProductDialog({ open: true, product })}
                    className="rounded-lg"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDeleteProduct(product.id)}
                    className="rounded-lg text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Tables Tab */}
        <TabsContent value="tables" className="space-y-4">
          <Button
            onClick={() => setTableDialog({ open: true, table: null })}
            className="w-full rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Table
          </Button>

          <div className="space-y-3">
            {tables.map((table) => (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border-2 border-border p-4 flex items-center gap-4"
              >
                <Store className="h-10 w-10 text-muted-foreground" />
                <div className="flex-1">
                  <h3 className="font-semibold">{table.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {table.status === "active" ? `Active • ₹${table.total.toFixed(2)}` : "Empty"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setTableDialog({ open: true, table })}
                    className="rounded-lg"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDeleteTable(table.id)}
                    className="rounded-lg text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Dialog */}
      <ProductDialog
        open={productDialog.open}
        product={productDialog.product}
        onClose={() => setProductDialog({ open: false, product: null })}
        onSave={handleSaveProduct}
      />

      {/* Table Dialog */}
      <TableDialog
        open={tableDialog.open}
        table={tableDialog.table}
        onClose={() => setTableDialog({ open: false, table: null })}
        onSave={handleSaveTable}
      />
    </div>
  );
}

function ProductDialog({ open, product, onClose, onSave }: any) {
  const [formData, setFormData] = useState({ name: "", price: "", image: "" });

  useEffect(() => {
    if (product) {
      setFormData({ 
        name: product.name, 
        price: product.price.toString(), 
        image: product.image || "" 
      });
    } else {
      setFormData({ name: "", price: "", image: "" });
    }
  }, [product, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error("Name and price are required");
      return;
    }
    
    onSave({
      ...product,
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              placeholder="e.g., Coffee"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="productPrice">Price (₹) *</Label>
            <Input
              id="productPrice"
              type="number"
              step="0.01"
              placeholder="99.00"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="productImage">Image URL (Optional)</Label>
            <Input
              id="productImage"
              type="url"
              placeholder="https://..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            {product ? "Update" : "Create"} Product
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TableDialog({ open, table, onClose, onSave }: any) {
  const [name, setName] = useState("");

  useEffect(() => {
    setName(table?.name || "");
  }, [table, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      toast.error("Table name is required");
      return;
    }
    
    onSave({ ...table, name });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{table ? "Edit Table" : "Add Table"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="tableName">Table Name *</Label>
            <Input
              id="tableName"
              placeholder="e.g., Table 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            {table ? "Update" : "Create"} Table
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
