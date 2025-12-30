import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";
import { useEffect, useState } from "react";
import ReportFilters from "./ReportFilters";

interface CustomerRow {
  customer_name: string;
  total_jobs: number;
  total_spent: number;
}

const CustomerReport = () => {
  const today = new Date().toISOString().split("T")[0];
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    from: firstDay,
    to: today,
  });

  const loadData = () => {
    setLoading(true);
    axios
      .get("http://localhost:5000/api/admin/reports/customers", {
        params: filters,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setRows(res.data))
      .finally(() => setLoading(false));
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
      />

      {/* Header */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold">Customer Report</h2>
        <p className="text-sm text-muted-foreground">
          All customers with total jobs and total amount spent
        </p>
      </Card>

      {/* Table */}
      <div className="overflow-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center">Total Jobs</TableHead>
              <TableHead className="text-right">Total Spent (₹)</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            )}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  No customers found
                </TableCell>
              </TableRow>
            )}

            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{r.customer_name}</TableCell>
                <TableCell className="text-center">{r.total_jobs}</TableCell>
                <TableCell className="text-right font-semibold text-primary">
                  ₹{Number(r.total_spent).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CustomerReport;
