import { ShoppingCart, Store } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Table } from "./Home";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface CartBarProps {
  count: number;
  total: number;
  selectedTable: string | null;
  tables: Table[];
  onTableChange: (tableId: string | null) => void;
}

export function CartBar({ count, total, selectedTable, tables, onTableChange }: CartBarProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl z-50"
    >
      <div className="p-4 space-y-3">
        {/* Table Selector */}
        <div className="flex items-center gap-3">
          <Store className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <Select 
            value={selectedTable || "no-table"} 
            onValueChange={(value) => onTableChange(value === "no-table" ? null : value)}
          >
            <SelectTrigger className="flex-1 rounded-xl border-2">
              <SelectValue placeholder="Select table (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-table">No Table</SelectItem>
              {tables.map(table => (
                <SelectItem key={table.id} value={table.id}>
                  {table.name} {table.status === "active" && `(₹${table.total.toFixed(2)})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cart Summary */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/checkout")}
          disabled={count === 0}
          className={`
            w-full rounded-2xl p-4 flex items-center justify-between
            transition-all duration-300
            ${count > 0 
              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-xl shadow-emerald-500/30 hover:shadow-2xl" 
              : "bg-muted text-muted-foreground cursor-not-allowed"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              {count > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-white text-emerald-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                >
                  {count}
                </motion.div>
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">
                {count === 0 ? "Cart is empty" : `${count} ${count === 1 ? "item" : "items"}`}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold">₹{total.toFixed(2)}</p>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
