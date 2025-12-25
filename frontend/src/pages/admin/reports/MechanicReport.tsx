import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";

const MechanicReport = () => {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/admin/reports/mechanics", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => setRows(res.data));
  }, []);

  return (
    <div className="space-y-3">
      {rows.map((m, i) => (
        <Card key={i} className="p-4 flex justify-between">
          <div>
            <div className="font-semibold">{m.mechanic}</div>
            <div className="text-sm">Jobs: {m.jobs_completed}</div>
          </div>
          <div className="font-bold">₹{m.labor_earned}</div>
        </Card>
      ))}
    </div>
  );
};

export default MechanicReport;
