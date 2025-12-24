import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const AdminUserDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/admin/users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data);
    };
    fetchDetails();
  }, [id]);

  if (!data) return <div className="p-6 text-center text-muted-foreground">Loading...</div>;

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-8">

        {/* CUSTOMER INFO */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
          <h2 className="text-2xl font-semibold text-foreground mb-1">
            {data.customer.name}
          </h2>
          <p className="text-muted-foreground">{data.customer.email}</p>
          <p className="text-muted-foreground">{data.customer.phone}</p>
          <div className="mt-2 text-xs text-gray-400">
            Customer since: {new Date(data.customer.created_at).toDateString()}
          </div>
        </div>

        {/* VEHICLES */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Vehicles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.vehicles.map((v: any) => (
              <div key={v.id} className="bg-white/5 p-4 rounded-xl border border-white/20 hover:shadow-lg transition">
                <div className="font-medium text-foreground">{v.make} {v.model}</div>
                <div className="text-sm text-muted-foreground">Year: {v.year}</div>
                <div className="text-sm text-muted-foreground">Engine: {v.engine_type || "N/A"}</div>
                <div className="text-sm text-muted-foreground">Mileage: {v.mileage || "N/A"} km</div>
              </div>
            ))}
          </div>
        </div>

        {/* SERVICE HISTORY */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Service History</h3>

          {data.jobCards.length === 0 && (
            <p className="text-muted-foreground">No service history found</p>
          )}

          <div className="space-y-4">
            {data.jobCards.map((jc: any) => (
              <div key={jc.id} className="bg-white/5 border border-white/20 rounded-xl p-5 hover:shadow-lg transition">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">{jc.make} {jc.model}</span>
                  <span className={`px-3 py-1 text-xs rounded-full font-medium
                    ${
                      jc.status === "completed" ? "bg-green-700/20 text-green-300" :
                      jc.status === "in_progress" ? "bg-yellow-700/20 text-yellow-300" :
                      "bg-gray-700/20 text-gray-300"
                    }`}>
                    {jc.status}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground mt-1">
                  <b>Service Center:</b> {jc.service_center_name} ({jc.service_center_city})
                </div>

                <div className="text-sm text-muted-foreground mt-1">
                  <b>Mechanic:</b> {jc.mechanic_name || "Not assigned"}
                </div>

                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm text-muted-foreground">
                    <b>Invoice:</b> ₹{jc.total_amount || 0}
                  </div>

                  <span className={`text-xs px-3 py-1 rounded-full font-medium
                    ${jc.invoice_status === "paid" ? "bg-green-700/20 text-green-300" : "bg-red-700/20 text-red-300"}`}>
                    {jc.invoice_status || "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminUserDetails;
