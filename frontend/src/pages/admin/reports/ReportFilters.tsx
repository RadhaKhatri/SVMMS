import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/* ================================
   Reusable Filter Props
================================ */
export interface ReportFiltersProps {
  filters: {
    from: string;
    to: string;
    city?: string;
    serviceCenterId?: string;
    status?: string;
  };
  setFilters: (v: any) => void;
  onApply: () => void;

  showStatus?: boolean;
  showCity?: boolean;
  showServiceCenter?: boolean;
}

/* ================================
   Component
================================ */
const ReportFilters = ({
  filters,
  setFilters,
  onApply,
  showStatus = false,
  showCity = false,
  showServiceCenter = false,
}: ReportFiltersProps) => {
  const today = new Date().toISOString().split("T")[0];

  const setPreset = (type: "today" | "thisMonth" | "lastMonth") => {
    const now = new Date();
    let from = today;
    let to = today;

    if (type === "thisMonth") {
      from = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
    }

    if (type === "lastMonth") {
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString()
        .split("T")[0];
      to = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString()
        .split("T")[0];
    }

    setFilters({ ...filters, from, to });
  };

  return (
    <Card className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* FROM */}
        <div>
          <label className="text-xs">From</label>
          <Input
            type="date"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </div>

        {/* TO */}
        <div>
          <label className="text-xs">To</label>
          <Input
            type="date"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>

        {/* CITY */}
        {showCity && (
          <Input
            placeholder="City"
            value={filters.city || ""}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          />
        )}

        {/* SERVICE CENTER */}
        {showServiceCenter && (
          <Input
            placeholder="Service Center ID"
            value={filters.serviceCenterId || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                serviceCenterId: e.target.value,
              })
            }
          />
        )}

        {/* STATUS */}
        {showStatus && (
          <Input
            placeholder="Status (open / completed)"
            value={filters.status || ""}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setPreset("today")}>
          Today
        </Button>
        <Button variant="outline" onClick={() => setPreset("thisMonth")}>
          This Month
        </Button>
        <Button variant="outline" onClick={() => setPreset("lastMonth")}>
          Last Month
        </Button>

        <Button className="ml-auto" onClick={onApply}>
          Apply Filter
        </Button>
      </div>
    </Card>
  );
};

export default ReportFilters;
