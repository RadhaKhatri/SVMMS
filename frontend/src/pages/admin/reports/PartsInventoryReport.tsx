import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";

interface InventoryRow {
  service_center: string;
  part_name: string;
  category: string;
  quantity: number;
  reorder_level: number;
  updated_at: string;
}

const PartsInventoryReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    service_center_id: "",
    category: "",
    from: "",
    to: today,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/reports/inventory",
        {
          params: filters,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setRows(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">Parts Inventory Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Service Center ID"
            value={filters.service_center_id}
            onChange={(e) =>
              setFilters({ ...filters, service_center_id: e.target.value })
            }
          />
          <Input
            placeholder="Part Category"
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          />
          <Input
            type="date"
            placeholder="From"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
          <Input
            type="date"
            placeholder="To"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <Button className="mt-2" onClick={loadData}>
          Apply Filters
        </Button>
      </Card>

      {/* Inventory List */}
      {loading ? (
        <Card className="p-4 text-center">Loading...</Card>
      ) : rows.length === 0 ? (
        <Card className="p-4 text-center">No inventory data found</Card>
      ) : (
        <div className="space-y-3">
          {rows.map((p, i) => (
            <Card key={i} className="p-4">
              <div className="font-semibold">{p.part_name}</div>
              <div className="text-sm text-muted-foreground">
                {p.service_center} • Category: {p.category} • Qty: {p.quantity}{" "}
                / Reorder: {p.reorder_level}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PartsInventoryReport;
