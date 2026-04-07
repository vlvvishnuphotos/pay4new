import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Receipt, Calendar, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { ordersAPI } from "../lib/api";
import { toast } from "sonner";

export function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const data = await ordersAPI.getAll();
      setOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  function calculateStats() {
    const today = new Date().setHours(0, 0, 0, 0);
    const todayOrders = orders.filter(order => new Date(order.createdAt).setHours(0, 0, 0, 0) === today);
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    return {
      totalOrders: orders.length,
      todayOrders: todayOrders.length,
      todayRevenue,
      totalRevenue,
    };
  }

  const stats = calculateStats();

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
            <h1 className="text-xl font-bold">Order History</h1>
            <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-xl shadow-emerald-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Today</span>
            </div>
            <p className="text-2xl font-bold">₹{stats.todayRevenue.toFixed(2)}</p>
            <p className="text-sm opacity-80">{stats.todayOrders} orders</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-xl shadow-blue-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</p>
            <p className="text-sm opacity-80">{stats.totalOrders} orders</p>
          </motion.div>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Recent Orders</h2>
          
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-2xl border-2 border-border">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl border-2 border-border p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        #{order.id.split(':')[1].substring(0, 8)}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600">₹{order.total.toFixed(2)}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p>{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Items:</p>
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {order.discount > 0 && (
                  <div className="text-sm text-emerald-600">
                    Discount: -₹{order.discount.toFixed(2)}
                  </div>
                )}

                {order.customer && (
                  <div className="text-sm text-muted-foreground border-t border-border pt-2">
                    {order.customer.name && <p>Customer: {order.customer.name}</p>}
                    {order.customer.email && <p>Email: {order.customer.email}</p>}
                    {order.customer.phone && <p>Phone: {order.customer.phone}</p>}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
