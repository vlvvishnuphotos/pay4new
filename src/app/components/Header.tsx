import { Moon, Sun, Settings, Receipt } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg"
    >
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              FlowPOS
            </h1>
            <p className="text-xs text-muted-foreground">Point of Sale</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/orders")}
            className="rounded-xl"
          >
            <Receipt className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            className="rounded-xl"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-xl"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
