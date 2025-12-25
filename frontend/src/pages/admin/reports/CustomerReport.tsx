import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";

const CustomerReport = () => {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/reports/customers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(res => setCustomers(res.data));
  }, []);

  return (
    <div className="space-y-3">
      {customers.map((c, i) => (
        <Card key={i} className="p-4 flex justify-between">
          <div>
            <div className="font-semibold">{c.customer_name}</div>
            <div className="text-sm text-muted-foreground">
              Jobs: {c.total_jobs}
            </div>
          </div>
          <div className="font-bold text-primary">
            ₹{c.total_spent}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CustomerReport;
