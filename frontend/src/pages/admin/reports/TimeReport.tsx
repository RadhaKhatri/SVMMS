import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";

const TimeReport = () => {
  const [peakHours, setPeakHours] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);

  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    axios
      .get("http://localhost:5000/api/admin/reports/time/peak", { headers })
      .then(res => setPeakHours(res.data));

    axios
      .get("http://localhost:5000/api/admin/reports/time/monthly", { headers })
      .then(res => setMonthly(res.data));
  }, []);

  return (
    <div className="space-y-6">
      {/* Peak Hours */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Peak Service Hours</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {peakHours.map((p, i) => (
            <Card key={i} className="p-4 text-center">
              <div className="text-sm text-muted-foreground">
                Hour {p.hour}:00
              </div>
              <div className="text-xl font-bold">{p.jobs}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Monthly Job Trend</h3>
        <div className="space-y-2">
          {monthly.map((m, i) => (
            <Card key={i} className="p-3 flex justify-between">
              <span>{m.month}</span>
              <span className="font-semibold">{m.jobs}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeReport;
