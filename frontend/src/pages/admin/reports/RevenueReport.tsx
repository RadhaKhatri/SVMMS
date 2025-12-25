import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody
} from "@/components/ui/table";
import ReportFilters from "./ReportFilters";
import ReportActions from "./ReportActions";

const RevenueReport = () => {
  const today = new Date();

  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];

  const todayDate = today.toISOString().split("T")[0];

  const [rows, setRows] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    from: firstDayOfMonth,
    to: todayDate,
    city: "",
    serviceCenterId: ""
  });

  const loadData = () => {
    axios
      .get("http://localhost:5000/api/admin/reports/revenue/detailed", {
        params: {
          from: filters.from,
          to: filters.to,
          city: filters.city || undefined,
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

      {/* 🔍 Filters */}
      <ReportFilters
        filters={filters}
        setFilters={setFilters}
        onApply={loadData}
      />

      {/* 📤 Export Actions */}
      <ReportActions section="revenue" filters={filters} />

      {/* 📊 Table */}
      <div className="overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Service Center</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Job ID</TableHead>
              <TableHead>Job Status</TableHead>
              <TableHead>Labor ₹</TableHead>
              <TableHead>Parts ₹</TableHead>
              <TableHead>Tax ₹</TableHead>
              <TableHead>Discount ₹</TableHead>
              <TableHead>Total ₹</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.invoice_number}</TableCell>
                <TableCell>{r.invoice_date}</TableCell>
                <TableCell>{r.customer_name}</TableCell>
                <TableCell>{r.customer_email}</TableCell>
                <TableCell>{r.service_center_name}</TableCell>
                <TableCell>{r.city}</TableCell>
                <TableCell>{r.job_card_id}</TableCell>
                <TableCell>{r.job_status}</TableCell>
                <TableCell>₹{r.labor_total}</TableCell>
                <TableCell>₹{r.parts_total}</TableCell>
                <TableCell>₹{r.tax}</TableCell>
                <TableCell>₹{r.discount}</TableCell>
                <TableCell className="font-semibold text-primary">
                  ₹{r.total_amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

    </div>
  );
};

export default RevenueReport;
