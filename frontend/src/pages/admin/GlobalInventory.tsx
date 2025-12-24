import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";

const GlobalInventory = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/inventory", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).then(res => setItems(res.data));
  }, []);

  return (
    <div className="grid gap-3">
      {items.map(i => (
        <Card key={i.id} className="p-4 flex justify-between">
          <div>
            <div className="font-semibold">{i.name}</div>
            <div className="text-sm text-muted-foreground">
              {i.service_center} • {i.category}
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold">{i.quantity}</div>
            <div className="text-xs">Reorder: {i.reorder_level}</div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default GlobalInventory;
