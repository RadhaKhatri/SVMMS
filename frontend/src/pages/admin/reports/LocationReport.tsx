import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";

const LocationReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ from: "", to: today });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/reports/locations/city-revenue",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          params: filters.from && filters.to ? filters : {},
        }
      );
      setCities(res.data);
    } catch (err) {
      console.error("Error loading city revenue:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold">City-wise Revenue Report</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

      {/* Report */}
      {loading ? (
        <Card className="p-4 text-center">Loading...</Card>
      ) : cities.length === 0 ? (
        <Card className="p-4 text-center">No data found</Card>
      ) : (
        <div className="space-y-3">
          {cities.map((c, i) => (
            <Card key={i} className="p-4 flex justify-between">
              <div className="font-semibold">{c.city}</div>
              <div className="font-bold text-primary">₹{c.revenue}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationReport;
