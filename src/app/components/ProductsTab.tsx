import { useState, useMemo } from "react";
import { Product, CartItem } from "./Home";
import { motion, AnimatePresence } from "motion/react";
import { Search, Grid3x3, List, Plus, ImageIcon } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface ProductsTabProps {
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  selectedTable: string | null;
  onRefresh: () => void;
}

export function ProductsTab({ products, cart, onAddToCart, selectedTable }: ProductsTabProps) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  function getProductQuantity(productId: string) {
    const item = cart.find(i => i.id === productId);
    return item ? item.quantity : 0;
  }

  return (
    <div className="space-y-4 p-4">
      {/* Search and View Toggle */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl border-2 focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          <Button
            size="icon"
            variant={viewMode === "grid" ? "default" : "ghost"}
            onClick={() => setViewMode("grid")}
            className="rounded-lg"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant={viewMode === "list" ? "default" : "ghost"}
            onClick={() => setViewMode("list")}
            className="rounded-lg"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table Selection Notice */}
      {!selectedTable && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
        >
          <p className="text-sm text-amber-700 dark:text-amber-400">
            💡 Select a table first or continue without a table
          </p>
        </motion.div>
      )}

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {search ? "No products found" : "No products yet"}
          </p>
        </div>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-2 gap-4" 
            : "space-y-3"
        }>
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={getProductQuantity(product.id)}
                onAdd={onAddToCart}
                viewMode={viewMode}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  quantity: number;
  onAdd: (product: Product) => void;
  viewMode: "grid" | "list";
  index: number;
}

function ProductCard({ product, quantity, onAdd, viewMode, index }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ delay: index * 0.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onAdd(product)}
        className="relative flex items-center gap-4 p-4 bg-card rounded-xl border-2 border-border hover:border-emerald-500/50 cursor-pointer transition-all hover:shadow-lg"
      >
        {/* Image */}
        <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {product.image && !imageError ? (
            <img 
              src={product.image} 
              alt={product.name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{product.name}</h3>
          <p className="text-lg font-bold text-emerald-600">₹{product.price.toFixed(2)}</p>
        </div>

        {/* Quantity Badge */}
        <AnimatePresence>
          {quantity > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1">
                {quantity}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        <Plus className="h-5 w-5 text-muted-foreground" />
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onAdd(product)}
      className="relative bg-card rounded-2xl border-2 border-border hover:border-emerald-500/50 cursor-pointer transition-all hover:shadow-xl overflow-hidden group"
    >
      {/* Image */}
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {product.image && !imageError ? (
          <img 
            src={product.image} 
            alt={product.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <ImageIcon className="h-12 w-12 text-muted-foreground" />
        )}
      </div>

      {/* Quantity Badge */}
      <AnimatePresence>
        {quantity > 0 && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="absolute top-2 right-2 z-10"
          >
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 shadow-lg text-base">
              {quantity}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
        <p className="text-lg font-bold text-emerald-600">₹{product.price.toFixed(2)}</p>
      </div>

      {/* Add Button Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="bg-white text-emerald-600 rounded-full p-3 shadow-lg"
        >
          <Plus className="h-5 w-5" />
        </motion.div>
      </div>
    </motion.div>
  );
}
