import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Car, ChevronRight, Clock, FileText, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const stats = [
    { title: "My Vehicles", value: "3", icon: Car, trend: "+1 this month" },
    { title: "Active Bookings", value: "1", icon: Calendar, trend: "In progress" },
    { title: "Completed Services", value: "12", icon: FileText, trend: "+3 this month" },
    { title: "Pending Approval", value: "1", icon: Clock, trend: "Awaiting review" },
  ];

  const recentServices = [
    {
      id: 1,
      vehicle: "Toyota Camry - ABC1234",
      service: "Oil Change & Filter",
      date: "2024-01-15",
      status: "completed",
      amount: "$89.99",
    },
    {
      id: 2,
      vehicle: "Honda Civic - XYZ5678",
      service: "Brake Inspection",
      date: "2024-01-10",
      status: "in-service",
      amount: "$150.00",
    },
  ];

  return (
    <DashboardLayout role="customer">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, <span className="text-primary">John!</span>
            </h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your vehicles</p>
          </div>
          <Link to="/bookings">
            <Button className="gradient-primary text-primary-foreground glow-primary">
              Book New Service
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="bg-card/50 bg-white/10 hover:border-primary/30 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-card/50 bg-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-3 flex-wrap">
            <Link to="/bookings">
              <Button className="gradient-primary text-primary-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Book Service
              </Button>
            </Link>
            <Link to="/vehicles">
              <Button variant="outline" className="border-primary/50 text-foreground hover:bg-primary/10">
                <Car className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </Link>
            <Link to="/invoices">
              <Button variant="outline" className="bg-white/10 text-foreground hover:bg-secondary">
                <FileText className="mr-2 h-4 w-4" />
                View Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Services */}
        <Card className="bg-card/50 bg-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Services</CardTitle>
            <Link to="/bookings">
              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 bg-secondary/30 border bg-white/10 rounded-xl hover:border-primary/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{service.vehicle}</div>
                      <div className="text-sm text-muted-foreground">{service.service}</div>
                      <div className="text-xs text-muted-foreground mt-1">{service.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      className={
                        service.status === "completed"
                          ? "bg-success/20 text-success border-success/30"
                          : "bg-warning/20 text-warning border-warning/30"
                      }
                    >
                      {service.status === "completed" ? "Completed" : "In Service"}
                    </Badge>
                    <div className="text-right">
                      <div className="font-bold text-lg text-primary">{service.amount}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
