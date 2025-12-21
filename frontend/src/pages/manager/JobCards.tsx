import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface JobCard {
  job_card_id: number;
  status: string;
  service_type: string;
  customer_name: string;
  vehicle: string;
  mechanic_name?: string;
}

const JobCards = () => {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/manager/job-cards",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setJobCards(res.data || []);
      } catch (err) {
        console.error("Failed to load job cards", err);
      }
    };

    fetchJobCards();
  }, []);

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      open: "bg-yellow-500/20 text-yellow-600",
      "in-service": "bg-blue-500/20 text-blue-600 ",
      completed: "bg-green-500/20 text-green-600",
      
    };

    return (
      <Badge className={map[status] || "bg-gray-700 text-white"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <DashboardLayout role="manager">
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Job Cards</h1>

        {jobCards.length === 0 && (
          <p className="text-muted-foreground">No job cards found.</p>
        )}

        {jobCards.map((jc) => (
          <Card key={jc.job_card_id} className="bg-card/60 border-white/30 ">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center ">
                <CardTitle>
  {Array.isArray(jc.service_type)
    ? jc.service_type.join(", ")
    : jc.service_type || "Service Job"}
</CardTitle>
                {getStatusBadge(jc.status)}
              </div>
            </CardHeader> 

            <CardContent className="flex justify-between items-center ">
              <div className="text-sm space-y-1 ">
                <div><b>Customer:</b> {jc.customer_name}</div>
                <div><b>Vehicle:</b> {jc.vehicle}</div>
                <div>
                  <b>Mechanic:</b>{" "}
                  {jc.mechanic_name || "Not Assigned"}
                </div>
              </div>

              <Button className="border-white/30"
                variant="outline"
                onClick={() =>
                  navigate(`/manager/job-cards/${jc.job_card_id}`)
                }
              >
                View Job Card
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default JobCards;
