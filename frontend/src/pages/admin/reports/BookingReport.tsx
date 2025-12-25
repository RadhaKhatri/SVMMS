import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";

const BookingReport = () => {
  const [byService, setByService] = useState<any[]>([]);
  const [byStatus, setByStatus] = useState<any[]>([]);

  useEffect(() => {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    axios
      .get("http://localhost:5000/api/admin/reports/bookings/services", { headers })
      .then(res => setByService(res.data));

    axios
      .get("http://localhost:5000/api/admin/reports/bookings/status", { headers })
      .then(res => setByStatus(res.data));
  }, []);

  return (
    <div className="space-y-6">
      {/* Booking by Service */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Bookings by Service Type</h3>
        <div className="space-y-2">
          {byService.map((s, i) => (
            <Card key={i} className="p-3 flex justify-between">
              <span>{s.service_name}</span>
              <span className="font-semibold">{s.total_bookings}</span>
            </Card>
          ))}
        </div>
      </div>

      {/* Booking by Status */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Booking Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {byStatus.map((s, i) => (
            <Card key={i} className="p-4 text-center">
              <div className="text-sm text-muted-foreground">{s.status}</div>
              <div className="text-xl font-bold">{s.count}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingReport;
