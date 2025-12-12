import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Package, Plus, Search } from "lucide-react";

const Inventory = () => {
  const parts = [
    { id: 1, name: "Brake Pad Set (Front)", category: "Brakes", sku: "BP-FR-001", stock: 15, minStock: 10, price: 89.99, supplier: "AutoParts Inc" },
    { id: 2, name: "Engine Oil Filter", category: "Engine", sku: "EO-FLT-002", stock: 45, minStock: 20, price: 12.99, supplier: "FilterPro" },
    { id: 3, name: "Brake Fluid DOT 4", category: "Fluids", sku: "BF-D4-003", stock: 8, minStock: 15, price: 14.99, supplier: "FluidMaster" },
    { id: 4, name: "Air Filter", category: "Engine", sku: "AF-STD-004", stock: 32, minStock: 15, price: 18.99, supplier: "FilterPro" },
    { id: 5, name: "Wiper Blade Set", category: "Exterior", sku: "WB-SET-005", stock: 5, minStock: 10, price: 24.99, supplier: "AutoParts Inc" },
  ];

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Out of Stock", className: "bg-destructive/20 text-destructive border-destructive/30" };
    if (stock < minStock) return { label: "Low Stock", className: "bg-warning/20 text-warning border-warning/30" };
    return { label: "In Stock", className: "bg-success/20 text-success border-success/30" };
  };

  const lowStockItems = parts.filter(p => p.stock < p.minStock);

  return (
    <DashboardLayout role="manager">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory <span className="text-primary">Management</span></h1>
            <p className="text-muted-foreground mt-1">Track and manage spare parts inventory</p>
          </div>
          <Button className="gradient-primary text-primary-foreground glow-primary">
            <Plus className="mr-2 h-4 w-4" /> Add Part
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 bg-white/10">
            <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Total Parts</CardTitle></CardHeader>
            <CardContent><div className="text-4xl font-bold text-foreground">{parts.length}</div></CardContent>
          </Card>
          <Card className="bg-card/50 bg-white/10">
            <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Low Stock Alerts</CardTitle></CardHeader>
            <CardContent><div className="text-4xl font-bold text-warning">{lowStockItems.length}</div></CardContent>
          </Card>
          <Card className="bg-card/50 bg-white/10">
            <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground">Total Value</CardTitle></CardHeader>
            <CardContent><div className="text-4xl font-bold text-primary">${parts.reduce((sum, p) => sum + p.price * p.stock, 0).toFixed(2)}</div></CardContent>
          </Card>
        </div>

        {lowStockItems.length > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="h-5 w-5" /> Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lowStockItems.map((part) => (
                <div key={part.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{part.name}</span>
                  <span className="text-muted-foreground">Only {part.stock} left (Min: {part.minStock})</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search parts by name or SKU..." className="pl-10 bg-secondary/50 bg-white/10" />
        </div>

        <Card className="bg-card/50 bg-white/10">
          <CardHeader><CardTitle className="text-lg">Parts Inventory</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {parts.map((part) => {
              const status = getStockStatus(part.stock, part.minStock);
              return (
                <div key={part.id} className="flex items-center justify-between p-4 bg-secondary/30 border bg-white/10 rounded-xl hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg"><Package className="h-6 w-6 text-primary" /></div>
                    <div>
                      <div className="font-semibold text-foreground">{part.name}</div>
                      <div className="text-sm text-muted-foreground">SKU: {part.sku} | {part.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">{part.stock}</div>
                      <div className="text-xs text-muted-foreground">in stock</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">${part.price}</div>
                    </div>
                    <Badge className={status.className}>{status.label}</Badge>
                    <Button variant="outline" size="sm" className="bg-white/10">Edit</Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
