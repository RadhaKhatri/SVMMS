import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import {
  AlertTriangle,
  Package,
  PackageMinus,
  Plus,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import InventoryForm from "./InventoryForm"; // adjust path

const Inventory = () => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any>(null);

  const fetchInventory = async () => {
    const res = await axios.get("http://localhost:5000/api/manager/inventory", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setItems(res.data);
  };

  const getStockStatus = (qty: number, reorder: number) => {
    if (qty === 0)
      return {
        label: "Out of Stock",
        className: "bg-destructive/20 text-destructive",
      };
    if (qty <= reorder)
      return { label: "Low Stock", className: "bg-warning/20 text-warning" };
    return { label: "In Stock", className: "bg-success/20 text-success" };
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/manager/inventory/logs",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to load inventory logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchLogs();
  }, []);

  return (
    <DashboardLayout role="manager">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Inventory <span className="text-primary">Management</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage spare parts inventory
            </p>
          </div>
        </div>

        {/* Add Part Button */}
        <Button
          onClick={() => {
            setSelectedPart(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Part
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 bg-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Total Parts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">
                {items.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 bg-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-warning">
                {" "}
                {items.filter((i) => i.quantity <= i.reorder_level).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 bg-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                ₹
                {items
                  .reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
                  .toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items
              .filter((i) => i.quantity <= i.reorder_level)
              .map((part) => (
                <div
                  key={part.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium text-foreground">
                    {part.name}
                  </span>
                  <span className="text-muted-foreground">
                    Only {part.quantity} left (Reorder at {part.reorder_level})
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parts by name or SKU..."
            className="pl-10 bg-secondary/50 bg-white/10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Card className="bg-card/50 bg-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Parts Inventory</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items
              .filter(
                (p) =>
                  p.name.toLowerCase().includes(search.toLowerCase()) ||
                  p.part_code.toLowerCase().includes(search.toLowerCase())
              )
              .map((part) => {
                const status = getStockStatus(
                  part.quantity,
                  part.reorder_level
                );
                return (
                  <div
                    key={part.id}
                    className="flex items-center justify-between p-4 bg-secondary/30 border bg-white/10 rounded-xl hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {part.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {part.part_code} | {part.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                          {part.quantity}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          in stock
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          ₹{part.unit_price}
                        </div>
                      </div>
                      <Badge className={status.className}>{status.label}</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white/10"
                        onClick={() => {
                          setSelectedPart(part); // this sets the part to edit
                          setFormOpen(true); // this opens the form modal
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Inventory <span className="text-primary">Usage Logs</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Track spare parts usage across job cards
          </p>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-muted-foreground">No inventory usage found</div>
        ) : (
          <div className="space-y-4">
            {logs.map((log, index) => (
              <Card key={index} className="bg-card/50 bg-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <PackageMinus className="h-5 w-5 text-warning" />
                    {log.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Job Card</span>
                    <div className="font-semibold">#{log.job_card_id}</div>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Quantity Used</span>
                    <div className="font-semibold">{log.quantity_used}</div>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Total Cost</span>
                    <div className="font-semibold text-primary">
                      ₹{log.total_price}
                    </div>
                  </div>

                  <div className="md:col-span-3 flex items-center justify-between mt-2">
                    <Badge variant="secondary">₹{log.unit_price} / unit</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {formOpen && (
        <InventoryForm
          part={selectedPart}
          onClose={() => setFormOpen(false)}
          onRefresh={fetchInventory}
        />
      )}
    </DashboardLayout>
  );
};

export default Inventory;
