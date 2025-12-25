import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";

const PartsInventoryReport = () => {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/reports/inventory/low-stock", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setRows(res.data));
  }, []);

  return (
    <div className="space-y-3">
      {rows.map((p, i) => (
        <Card key={i} className="p-4">
          <div className="font-semibold">{p.part_name}</div>
          <div className="text-sm text-muted-foreground">
            {p.service_center} • Qty: {p.quantity} / Reorder: {p.reorder_level}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PartsInventoryReport;
