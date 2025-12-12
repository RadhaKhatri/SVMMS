import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Users, Clock, CheckCircle } from "lucide-react";

const ManagerDashboard = () => {
  const stats = [
    { title: "Pending Approvals", value: "8", icon: FileText, color: "text-warning" },
    { title: "Active Mechanics", value: "12", icon: Users, color: "text-primary" },
    { title: "In Progress", value: "15", icon: Clock, color: "text-accent" },
    { title: "Completed Today", value: "23", icon: CheckCircle, color: "text-success" },
  ];

  const pendingBookings = [
    {
      id: 1,
      customer: "John Doe",
      vehicle: "2020 Toyota Camry - ABC1234",
      service: "Brake Repair",
      date: "2024-02-16",
      time: "10:00 AM",
      priority: "high",
    },
    {
      id: 2,
      customer: "Jane Smith",
      vehicle: "2019 Honda Civic - XYZ5678",
      service: "Oil Change",
      date: "2024-02-16",
      time: "2:00 PM",
      priority: "normal",
    },
  ];

  const availableMechanics = [
    { id: 1, name: "Mike Johnson", specialty: "Brake Systems", status: "available", jobs: 2 },
    { id: 2, name: "Sarah Williams", specialty: "Engine Repair", status: "busy", jobs: 3 },
    { id: 3, name: "Tom Brown", specialty: "Diagnostics", status: "available", jobs: 1 },
  ];

  return (
    <DashboardLayout role="manager">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Manager Dashboard</h1>
          <p className="text-muted-foreground">Manage bookings, mechanics, and workflow</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{booking.customer}</div>
                      <div className="text-sm text-muted-foreground">{booking.vehicle}</div>
                      <div className="text-sm font-medium mt-1">{booking.service}</div>
                    </div>
                    <Badge variant={booking.priority === "high" ? "destructive" : "secondary"}>
                      {booking.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {booking.date} at {booking.time}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Available Mechanics */}
          <Card>
            <CardHeader>
              <CardTitle>Mechanic Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableMechanics.map((mechanic) => (
                <div key={mechanic.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold">{mechanic.name}</div>
                      <div className="text-sm text-muted-foreground">{mechanic.specialty}</div>
                    </div>
                    <Badge variant={mechanic.status === "available" ? "default" : "secondary"}>
                      {mechanic.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Jobs: {mechanic.jobs}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
