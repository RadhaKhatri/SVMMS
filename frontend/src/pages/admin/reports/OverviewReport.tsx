import { Card } from "@/components/ui/card";
import axios from "axios";
import { useEffect, useState } from "react";

const OverviewReport = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/reports/summary", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  const items = [
    ["Total Revenue", `₹${data.total_revenue}`],
    ["Completed Jobs", data.completed_jobs],
    ["Total Bookings", data.total_bookings],
    ["Service Centers", data.service_centers],
    ["Customers", data.customers],
    ["Parts Used", data.total_parts_used],
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map(([label, value], i) => (
        <Card key={i} className="p-4">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </Card>
      ))}
    </div>
  );
};

export default OverviewReport;
