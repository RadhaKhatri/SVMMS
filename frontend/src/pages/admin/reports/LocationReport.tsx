import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "@/components/ui/card";

const LocationReport = () => {
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/admin/reports/locations/city-revenue", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(res => setCities(res.data));
  }, []);

  return (
    <div className="space-y-3">
      {cities.map((c, i) => (
        <Card key={i} className="p-4 flex justify-between">
          <div className="font-semibold">{c.city}</div>
          <div className="font-bold text-primary">
            ₹{c.revenue}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LocationReport;
