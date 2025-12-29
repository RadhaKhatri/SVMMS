import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const AdminServiceCenterDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/admin/service_centers/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data);
    };
    fetchDetails();
  }, [id]);

  if (!data) return <div>Loading...</div>;

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-8">

        {/* Service Center Info */}
        <div className="p-6 bg-white/10 rounded-2xl shadow-md border border-gray-700">
          <h2 className="text-2xl font-bold mb-2">{data.serviceCenter.name}</h2>
          <p className="text-sm text-muted-foreground">{data.serviceCenter.address}, {data.serviceCenter.city}</p>
          <p className="text-sm">Contact: <span className="font-medium">{data.serviceCenter.contact_number}</span></p>
          <p className="text-sm">Manager: <span className="font-medium">{data.serviceCenter.manager_name || "N/A"}</span></p>
        </div>

        {/* Mechanics */}
        <div>
          <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Mechanics</h3>
          {data.mechanics.length === 0 && <p className="text-muted-foreground">No mechanics assigned</p>}
          <div className="grid md:grid-cols-2 gap-4">
            {data.mechanics.map((m: any) => (
              <div key={m.id} className="p-4 bg-white/10 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
                <div className="font-semibold">{m.name}</div>
                <div className="text-sm text-muted-foreground">{m.email} • {m.phone}</div>
                <div className="text-sm mt-1">Status: <span className="font-medium">{m.status}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Cards */}
        <div>
          <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Job Cards</h3>
          {data.jobCards.length === 0 && <p className="text-muted-foreground">No job cards</p>}
          <div className="space-y-4">
            {data.jobCards.map((jc: any) => (
              <div key={jc.id} className="p-5 bg-white/10 rounded-2xl shadow border border-gray-700 hover:shadow-lg transition">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Status:</span> <span>{jc.status}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Vehicle:</span> <span>{jc.make} {jc.model} ({jc.vin})</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Customer:</span> <span>{jc.customer_name}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Mechanic:</span> <span>{jc.mechanic_name || "Not assigned"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Invoice:</span> <span>₹{jc.total_amount || 0} ({jc.invoice_status || "N/A"})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory */}
        <div>
          <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Inventory</h3>
          {data.inventory.length === 0 && <p className="text-muted-foreground">No inventory data</p>}
          <div className="grid md:grid-cols-2 gap-4">
            {data.inventory.map((inv: any) => (
              <div key={inv.part_id} className="p-4 bg-white/10 rounded-xl shadow hover:shadow-lg transition">
                <div className="font-semibold">{inv.part_name}</div>
                <div className="text-sm text-muted-foreground">
                  Qty: {inv.quantity} (Reorder: {inv.reorder_level}) • ₹{inv.unit_price} • Location: {inv.location}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminServiceCenterDetails;
