import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import axios from "axios";

interface ServiceCenter {
  id: number;
  name: string;
  city: string;
  status?: "pending" | "approved" | "rejected";
}

const MechanicDashboard = () => {
  const stats = [
    { title: "Assigned Jobs", value: "5", icon: FileText, color: "text-primary" },
    { title: "In Progress", value: "2", icon: Clock, color: "text-warning" },
    { title: "Completed Today", value: "3", icon: CheckCircle, color: "text-success" },
    { title: "Avg. Completion", value: "2.5h", icon: Wrench, color: "text-accent" },
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


  const { toast } = useToast();
  const token = localStorage.getItem("token");

  // Fetch service centers + request status
  const fetchServiceCenters = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/mechanic/request-center", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      toast({ title: "Request Sent", description: "Your request is now pending approval." });
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
          <h1 className="text-3xl font-bold text-foreground">Mechanic Dashboard</h1>
          <p className="text-muted-foreground">Manage your assigned job cards</p>
        </div>

           <Link to="/mechanic/service-center-requests">
          <Button variant="secondary" className="border border-white">
            Request Service Center
          </Button>
        </Link>

         <Link to="/mechanic/profile">
          <Button variant="outline" className="border border-white">My Profile</Button>
        </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
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
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary">{job.id}</span>
                      <Badge variant={job.priority === "high" ? "destructive" : "secondary"}>
                        {job.priority}
                      </Badge>
                    </div>
                    <h3 className="font-semibold mt-1">
                      {job.vehicle} - {job.plate}
                    </h3>
                    <p className="text-sm text-muted-foreground">{job.service}</p>
                  </div>
                  <Link to={`/mechanic/jobcard/${job.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Started at {job.startTime}</span>
                    <span className="font-medium">{job.progress}% Complete</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MechanicDashboard;
