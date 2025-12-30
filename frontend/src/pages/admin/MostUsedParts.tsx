import { Card } from "@/components/ui/card";
import axios from "axios";
import { useEffect, useState } from "react";

const MostUsedParts = () => {
  const [parts, setParts] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/inventory/most-used", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setParts(res.data));
  }, []);

  return (
    <div className="space-y-3">
      {parts.map((p, i) => (
        <Card key={p.part_id} className="p-4 text-sm">
          <div className="flex justify-between">
            <div>
              <div className="font-semibold">
                #{i + 1} {p.part_name}
              </div>
              <div className="text-muted-foreground">
                Category: {p.category}
              </div>
            </div>

            <div className="text-right">
              <div>Used: {p.total_quantity_used}</div>
              <div className="font-semibold text-primary">
                ₹{p.total_revenue}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MostUsedParts;
