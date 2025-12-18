import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const JobCardDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobCard = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/manager/job-cards/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setJob(res.data);
      } catch (err) {
        console.error("Failed to load job card", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobCard();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!job) return <div className="p-6">Job card not found</div>;

  return (
    <DashboardLayout role="manager">
      <div className="p-6 space-y-6">

        {/* HEADER */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Job Card #{job.id}</CardTitle>
            <Badge>{job.status?.toUpperCase()}</Badge>
          </CardHeader>
        </Card>

        {/* CUSTOMER */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div><b>Name:</b> {job.customer?.name}</div>
            <div><b>Phone:</b> {job.customer?.phone}</div>
            <div><b>Email:</b> {job.customer?.email}</div>
          </CardContent>
        </Card>

        {/* VEHICLE */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <b>Vehicle:</b>{" "}
              {job.vehicle?.make} {job.vehicle?.model} ({job.vehicle?.year})
            </div>
            <div><b>Engine:</b> {job.vehicle?.engine_type || "—"}</div>
            
            <div><b>VIN:</b> {job.vehicle?.vin || "—"}</div>
            <div><b>Mileage:</b> {job.vehicle?.mileage || "—"}</div>
          </CardContent>
        </Card>

        {/* SERVICE */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div><b>Service Type:</b> {job.service_type}</div>
            <div><b>Mechanic:</b> {job.mechanic?.name || "Not Assigned"}</div>
            <div><b>Preferred Date:</b> {job.timeline?.preferred_date}</div>
            <div><b>Preferred Time:</b> {job.timeline?.preferred_time}</div>
          </CardContent>
        </Card>

        {/* COST */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>Labor: ₹{job.costs?.labor}</div>
            <div>Parts: ₹{job.costs?.parts}</div>
            <div className="font-bold border-t pt-2">
              Total: ₹{(job.costs?.labor || 0) + (job.costs?.parts || 0)}
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default JobCardDetail;
