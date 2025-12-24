import { useEffect, useState } from "react";
import axios from "axios";
import { AlertTriangle } from "lucide-react";

const LowStock = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/inventory/low-stock", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then(res => setItems(res.data));
  }, []);

  return (
    <div className="space-y-3">
      {items.map((i, idx) => (
        <div key={idx} className="flex items-center gap-3 p-4 border rounded-lg">
          <AlertTriangle className="text-warning" />
          <div>
            <div className="font-semibold">{i.name}</div>
            <div className="text-sm text-muted-foreground">
              {i.service_center} • Qty {i.quantity}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LowStock;
