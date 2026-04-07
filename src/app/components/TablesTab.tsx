import { Table } from "./Home";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { tablesAPI } from "../lib/api";
import { toast } from "sonner";

interface TablesTabProps {
  tables: Table[];
  onTableSelect: (tableId: string) => void;
  onRefresh: () => void;
}

export function TablesTab({ tables, onTableSelect, onRefresh }: TablesTabProps) {
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [newTableName, setNewTableName] = useState("");

  async function handleAddTable() {
    if (!newTableName.trim()) {
      toast.error("Please enter a table name");
      return;
    }

    try {
      await tablesAPI.create({ name: newTableName });
      toast.success("Table added successfully");
      setNewTableName("");
      setIsAddingTable(false);
      onRefresh();
    } catch (error) {
      toast.error("Failed to add table");
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tables</h2>
        <Dialog open={isAddingTable} onOpenChange={setIsAddingTable}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Table</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="tableName">Table Name</Label>
                <Input
                  id="tableName"
                  placeholder="e.g., Table 1"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTable()}
                />
              </div>
              <Button onClick={handleAddTable} className="w-full">Add Table</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No tables yet</p>
          <Button onClick={() => setIsAddingTable(true)}>Add your first table</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {tables.map((table, index) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTableSelect(table.id)}
              className={`
                relative overflow-hidden rounded-2xl p-6 cursor-pointer
                transition-all duration-300
                ${table.status === "active" 
                  ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/20" 
                  : "bg-card border-2 border-border hover:border-emerald-500/50 hover:shadow-lg"
                }
              `}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{table.name}</h3>
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${table.status === "active" 
                      ? "bg-white/20 text-white" 
                      : "bg-muted text-muted-foreground"
                    }
                  `}>
                    {table.status === "active" ? "Active" : "Empty"}
                  </div>
                </div>
                {table.status === "active" && (
                  <p className="text-2xl font-bold">₹{table.total.toFixed(2)}</p>
                )}
              </div>
              
              {/* Decorative element */}
              <div className={`
                absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-20
                ${table.status === "active" ? "bg-white" : "bg-emerald-500"}
              `} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
