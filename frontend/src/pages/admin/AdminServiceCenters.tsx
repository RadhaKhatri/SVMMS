import DashboardLayout from "@/components/layouts/DashboardLayout";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminServiceCenters = () => {
  const [centers, setCenters] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCenters = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/admin/service_centers",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCenters(res.data);
    };
    fetchCenters();
  }, []);

  const filteredCenters = centers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.manager_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Service Centers</h1>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, city, or manager..."
          className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="space-y-3">
          {filteredCenters.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/admin/service_centers/${c.id}`)}
              className="p-4 border rounded-lg bg-white/10 hover:border-primary cursor-pointer transition"
            >
              <div className="font-semibold">{c.name}</div>
              <div className="text-sm text-muted-foreground">
                {c.city} • Manager: {c.manager_name || "N/A"}
              </div>
            </div>
          ))}
          {filteredCenters.length === 0 && (
            <p className="text-muted-foreground">No service centers found</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminServiceCenters;
