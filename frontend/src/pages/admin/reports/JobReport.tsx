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

const JobCardReport = () => {
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
    status: "",
    serviceCenterId: ""
  });

  const loadData = () => {
    axios
      .get("http://localhost:5000/api/admin/reports/jobs/detailed", {
        params: {
          from: filters.from,
          to: filters.to,
          status: filters.status || undefined,
          serviceCenterId: filters.serviceCenterId || undefined
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

      {/* Filters */}
      <ReportFilters
        filters={filters}
        setFilters={setFilters}
        onApply={loadData}
        showStatus
      />

      {/* Export */}
      <ReportActions section="jobcards" filters={filters} />

      <div className="overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Mechanic</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Service Center</TableHead>
              <TableHead>Labor ₹</TableHead>
              <TableHead>Parts ₹</TableHead>
              <TableHead>Total ₹</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.job_card_id}</TableCell>
                <TableCell>{r.job_date}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.customer_name}</TableCell>
                <TableCell>{r.mechanic_name || "-"}</TableCell>
                <TableCell>
                  {r.make} {r.model} ({r.year}) 
                </TableCell>
                <TableCell>{r.service_center}</TableCell>
                <TableCell>₹{r.total_labor_cost}</TableCell>
                <TableCell>₹{r.total_parts_cost}</TableCell>
                <TableCell className="font-semibold text-primary">
                  ₹{Number(r.total_labor_cost || 0) + Number(r.total_parts_cost || 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default JobCardReport;
