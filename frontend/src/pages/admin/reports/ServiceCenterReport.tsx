import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import ReportFilters from "./ReportFilters";
import ReportActions from "./ReportActions";

const ServiceCenterReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const firstDay = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString().split("T")[0];

  const [rows, setRows] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    from: firstDay,
    to: today,
    city: ""
  }); 

  const loadData = () => {
    axios
      .get("http://localhost:5000/api/admin/reports/service-centers", {
        params: {
          from: filters.from,
          to: filters.to,
          city: filters.city || undefined
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      })
      .then(res => setRows(res.data));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-4">

      {/* 🔍 Filters */}
      <ReportFilters
        filters={filters}
        setFilters={setFilters}
        onApply={loadData}
        showCity
      />

      {/* 📤 Export */}
      <ReportActions section="service_centers" filters={filters} />

      {/* 📊 Table */}
      <div className="overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Center</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Total Jobs</TableHead>
              <TableHead>Completed Jobs</TableHead>
              <TableHead>Total Revenue ₹</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.city}</TableCell>
                <TableCell>{r.total_jobs}</TableCell>
                <TableCell>{r.completed_jobs}</TableCell>
                <TableCell className="font-semibold text-primary">
                  ₹{r.revenue}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    </div>
  );
};

export default ServiceCenterReport;
