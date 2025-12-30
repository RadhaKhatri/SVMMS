import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { CheckCircle, Clock, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface ServiceCenter {
  id: number;
  name: string;
  city: string;
  status?: "pending" | "approved" | "rejected";
}

interface JobCard {
  job_card_id: number;
  status: "pending" | "in_progress" | "completed";
  created_at: string;
  service_type: string;
  vehicle: string;
  customer_name: string;
}

const MechanicDashboard = () => {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobCards = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/mechanic/job-cards",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobCards(res.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load job cards",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobCards();
  }, []);

  const assignedJobs = jobCards.length;
  const inProgress = jobCards.filter((j) => j.status === "in_progress").length;
  const completedToday = jobCards.filter(
    (j) =>
      j.status === "completed" &&
      new Date(j.created_at).toDateString() === new Date().toDateString()
  ).length;

  const stats = [
    { title: "Assigned Jobs", value: assignedJobs, icon: FileText },
    { title: "In Progress", value: inProgress, icon: Clock },
    { title: "Completed Today", value: completedToday, icon: CheckCircle },
  ];

  const activeJobs = [
    {
      id: "JC-001",
      vehicle: "2020 Toyota Camry",
      plate: "ABC1234",
      service: "Brake Repair",
      priority: "high",
      progress: 65,
      startTime: "09:00 AM",
    },
    {
      id: "JC-002",
      vehicle: "2019 Honda Civic",
      plate: "XYZ5678",
      service: "Oil Change",
      priority: "normal",
      progress: 30,
      startTime: "11:30 AM",
    },
  ];

  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  // Fetch service centers + request status
  const fetchServiceCenters = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/mechanic/request-center",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load service centers",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchServiceCenters();
  }, []);

  // Send request to join service center
  const handleRequest = async (id: number) => {
    try {
      await axios.post(
        `http://localhost:5000/api/mechanic/request-center/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({
        title: "Request Sent",
        description: "Your request is now pending approval.",
      });
      fetchServiceCenters(); // refresh status
    } catch (err) {
      toast({
        title: "Request Failed",
        description: "Could not send request",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout role="mechanic">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between ">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Mechanic Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your assigned job cards
            </p>
          </div>

          <Link to="/mechanic/service-center-requests">
            <Button variant="secondary" className="border border-white">
              Request Service Center
            </Button>
          </Link>

          <Link to="/mechanic/profile">
            <Button variant="outline" className="border border-white">
              My Profile
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="text-green" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Active Job Cards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">Loading jobs...</p>
            ) : jobCards.length === 0 ? (
              <p className="text-muted-foreground">No assigned job cards</p>
            ) : (
              jobCards.map((job) => (
                <div
                  key={job.job_card_id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-primary">
                          JC-{job.job_card_id}
                        </span>
                        <Badge
                          variant={
                            job.status === "completed"
                              ? "secondary"
                              : job.status === "in_progress"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>

                      <h3 className="font-semibold mt-1">{job.vehicle}</h3>

                      <p className="text-sm text-muted-foreground">
                        {job.service_type} • {job.customer_name}
                      </p>
                    </div>
                    <Button
                      onClick={() =>
                        navigate(`/mechanic/job-cards/${job.job_card_id}`)
                      }
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MechanicDashboard;
