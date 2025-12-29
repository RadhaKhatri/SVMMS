import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PeakHour {
  hour: number;
  jobs: number;
}

interface MonthlyTrend {
  month: string;
  jobs: number;
}

const TimeReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
  const [monthly, setMonthly] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    service_center_id: "",
    from: "",
    to: today,
  });

  const loadData = async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

    try {
      const [peakRes, monthlyRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/reports/time/peak", {
          headers,
          params: filters,
        }),
        axios.get("http://localhost:5000/api/admin/reports/time/monthly", {
          headers,
          params: filters,
        }),
      ]);

      setPeakHours(peakRes.data);
      setMonthly(monthlyRes.data);
    } catch (err) {
      console.error("Failed to load time reports:", err);
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
        <h2 className="text-lg font-semibold">Time & Trend Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Service Center ID"
            value={filters.service_center_id}
            onChange={(e) =>
              setFilters({ ...filters, service_center_id: e.target.value })
            }
          />
          <Input
            type="date"
            placeholder="From"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
          <Input
            type="date"
            placeholder="To"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>
        <Button className="mt-2" onClick={loadData}>
          Apply Filters
        </Button>
      </Card>

      {/* Peak Service Hours */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Peak Service Hours</h3>
        {loading ? (
          <Card className="p-4 text-center">Loading...</Card>
        ) : peakHours.length === 0 ? (
          <Card className="p-4 text-center">No data found</Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {peakHours.map((p, i) => (
              <Card key={i} className="p-4 text-center">
                <div className="text-sm text-muted-foreground">Hour {p.hour}:00</div>
                <div className="text-xl font-bold">{p.jobs}</div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Trend */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Monthly Job Trend</h3>
        {loading ? (
          <Card className="p-4 text-center">Loading...</Card>
        ) : monthly.length === 0 ? (
          <Card className="p-4 text-center">No data found</Card>
        ) : (
          <div className="space-y-2">
            {monthly.map((m, i) => (
              <Card key={i} className="p-3 flex justify-between">
                <span>{m.month}</span>
                <span className="font-semibold">{m.jobs}</span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeReport;
