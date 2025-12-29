import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ServiceBooking {
  service_name: string;
  total_bookings: number;
}

interface StatusBooking {
  status: string;
  count: number;
}

const BookingReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const [byService, setByService] = useState<ServiceBooking[]>([]);
  const [byStatus, setByStatus] = useState<StatusBooking[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    service_center_id: "",
    service_id: "",
    from: "",
    to: today
  });

  const loadData = async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

    try {
      const [serviceRes, statusRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/reports/bookings/services", {
          headers,
          params: filters
        }),
        axios.get("http://localhost:5000/api/admin/reports/bookings/status", {
          headers,
          params: filters
        })
      ]);

      setByService(serviceRes.data);
      setByStatus(statusRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">

      {/* Filters */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">Booking Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Service Center ID"
            value={filters.service_center_id}
            onChange={e => setFilters({ ...filters, service_center_id: e.target.value })}
          />
          <Input
            placeholder="Service ID"
            value={filters.service_id}
            onChange={e => setFilters({ ...filters, service_id: e.target.value })}
          />
          <Input
            type="date"
            placeholder="From"
            value={filters.from}
            onChange={e => setFilters({ ...filters, from: e.target.value })}
          />
          <Input
            type="date"
            placeholder="To"
            value={filters.to}
            onChange={e => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <Button className="mt-2" onClick={loadData}>Apply Filters</Button>
      </Card>

      {/* Booking by Service */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Bookings by Service Type</h3>
        {loading ? (
          <Card className="p-4 text-center">Loading...</Card>
        ) : byService.length === 0 ? (
          <Card className="p-4 text-center">No data found</Card>
        ) : (
          <div className="space-y-2">
            {byService.map((s, i) => (
              <Card key={i} className="p-3 flex justify-between">
                <span>{s.service_name}</span>
                <span className="font-semibold">{s.total_bookings}</span>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Booking by Status */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Booking Status</h3>
        {loading ? (
          <Card className="p-4 text-center">Loading...</Card>
        ) : byStatus.length === 0 ? (
          <Card className="p-4 text-center">No data found</Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {byStatus.map((s, i) => (
              <Card key={i} className="p-4 text-center">
                <div className="text-sm text-muted-foreground">{s.status}</div>
                <div className="text-xl font-bold">{s.count}</div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default BookingReport;
