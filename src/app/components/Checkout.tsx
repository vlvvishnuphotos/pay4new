import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Minus, Plus, Trash2, Receipt, Mail, Phone, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { cartAPI, ordersAPI, customersAPI, settingsAPI } from "../lib/api";
import { toast } from "sonner";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [discount, setDiscount] = useState({ type: "none" as "none" | "rupee" | "percent", value: 0 });
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    loadCart();
  }, []);

  async function loadCart() {
    try {
      const tableId = localStorage.getItem("selectedTable") || "no-table";
      const data = await cartAPI.get(tableId);
      setCart(data?.items || []);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  }

  function updateQuantity(id: string, newQuantity: number) {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev => prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  }

  function calculateSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  function calculateDiscount() {
    const subtotal = calculateSubtotal();
    if (discount.type === "rupee") {
      return Math.min(discount.value, subtotal);
    } else if (discount.type === "percent") {
      return (subtotal * discount.value) / 100;
    }
    return 0;
  }

  function calculateTotal() {
    return calculateSubtotal() - calculateDiscount();
  }

  async function handleCheckout() {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (!customer.email && !customer.phone) {
      toast.error("Please provide email or phone number");
      return;
    }

    setProcessing(true);

    try {
      const tableId = localStorage.getItem("selectedTable") || "no-table";
      
      // Save customer if provided
      let savedCustomer = null;
      if (customer.name || customer.email || customer.phone) {
        savedCustomer = await customersAPI.create(customer);
      }

      // Create order
      const order = await ordersAPI.create({
        tableId,
        items: cart,
        total: calculateTotal(),
        discount: calculateDiscount(),
        customer: savedCustomer,
      });

      setInvoice(order);
      setShowInvoice(true);
      
      // Clear cart
      await cartAPI.clear(tableId);
      
      toast.success("Order completed successfully!");
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to complete order");
    } finally {
      setProcessing(false);
    }
  }

  function handleInvoiceClose() {
    setShowInvoice(false);
    navigate("/");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
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
            <h1 className="text-xl font-bold">Checkout</h1>
            <p className="text-sm text-muted-foreground">{cart.length} items</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Cart Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border-2 border-border p-4 space-y-4"
        >
          <h2 className="font-semibold text-lg">Order Items</h2>
          
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-xl">
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="h-8 w-8 rounded-lg"
                >
                  {item.quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </Button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="h-8 w-8 rounded-lg"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-right font-semibold min-w-[80px]">
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Discount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border-2 border-border p-4 space-y-4"
        >
          <h2 className="font-semibold text-lg">Discount</h2>
          
          <div className="flex gap-2">
            <Button
              variant={discount.type === "none" ? "default" : "outline"}
              onClick={() => setDiscount({ type: "none", value: 0 })}
              className="flex-1"
            >
              None
            </Button>
            <Button
              variant={discount.type === "rupee" ? "default" : "outline"}
              onClick={() => setDiscount({ type: "rupee", value: 0 })}
              className="flex-1"
            >
              ₹ Amount
            </Button>
            <Button
              variant={discount.type === "percent" ? "default" : "outline"}
              onClick={() => setDiscount({ type: "percent", value: 0 })}
              className="flex-1"
            >
              % Percent
            </Button>
          </div>

          {discount.type !== "none" && (
            <Input
              type="number"
              placeholder={discount.type === "rupee" ? "Enter amount" : "Enter percentage"}
              value={discount.value || ""}
              onChange={(e) => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })}
              className="rounded-xl"
            />
          )}
        </motion.div>

        {/* Customer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border-2 border-border p-4 space-y-4"
        >
          <h2 className="font-semibold text-lg">Customer Info</h2>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Name (Optional)
              </Label>
              <Input
                id="name"
                placeholder="Customer name"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@email.com"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="rounded-xl"
              />
            </div>

            <p className="text-xs text-muted-foreground">* Provide at least email or phone</p>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border-2 border-border p-4 space-y-3"
        >
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">₹{calculateSubtotal().toFixed(2)}</span>
          </div>

          {calculateDiscount() > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span className="font-semibold">-₹{calculateDiscount().toFixed(2)}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-emerald-600">₹{calculateTotal().toFixed(2)}</span>
          </div>
        </motion.div>

        {/* Complete Order Button */}
        <Button
          onClick={handleCheckout}
          disabled={processing || cart.length === 0}
          className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-xl shadow-emerald-500/30"
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Complete Order
            </span>
          )}
        </Button>
      </div>

      {/* Invoice Dialog */}
      <Dialog open={showInvoice} onOpenChange={handleInvoiceClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Order Completed! 🎉</DialogTitle>
          </DialogHeader>
          
          {invoice && (
            <div className="space-y-4 pt-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto">
                  <Receipt className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-emerald-600">₹{invoice.total.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  Order ID: {invoice.id.split(':')[1].substring(0, 8)}
                </p>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{invoice.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="font-medium">{new Date(invoice.createdAt).toLocaleString()}</span>
                </div>
                {invoice.customer && (
                  <>
                    {invoice.customer.email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{invoice.customer.email}</span>
                      </div>
                    )}
                    {invoice.customer.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{invoice.customer.phone}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <Button onClick={handleInvoiceClose} className="w-full">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
