import { Card } from "@/components/ui/card";
import axios from "axios";
import { useEffect, useState } from "react";

const UsageLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/inventory/usage-logs", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setLogs(res.data));
  }, []);

  return (
    <div className="space-y-3">
      {logs.map((l, i) => (
        <Card key={i} className="p-4 text-sm">
          <div className="font-semibold">{l.name}</div>
          <div className="text-muted-foreground">
            {l.service_center} • Job #{l.job_card_id}
          </div>
          <div>
            Used {l.quantity_used} × ₹{l.unit_price} = ₹{l.total_price}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default UsageLogs;
