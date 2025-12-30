import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Calendar, Car, ChevronRight, Clock, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [recentServices, setRecentServices] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Stats fetch failed", err);
    }
  };

  const fetchRecentServices = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/dashboard/recent-services",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecentServices(res.data);
    } catch (err) {
      console.error("Recent services fetch failed", err);
    }
  };

  const fetchDashboard = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/dashboard/customer",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setStats(res.data.stats);
    setRecentServices(res.data.recentServices);
  };

  const statsConfig = {
    vehicles: Car,
    active: Calendar,
    completed: FileText,
    pending: Clock,
  };

  console.log("TOKEN:", token);

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("👤 User fetched:", res.data); // DEBUG
      setUser(res.data);
    } catch (err) {
      console.error("User fetch failed", err);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchUser();
    fetchStats();
    fetchRecentServices();
  }, [token]);

  return (
    <DashboardLayout role="customer">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, <span className="text-primary">{user?.name}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your vehicles
            </p>
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
          {stats.map((stat) => {
            const Icon = statsConfig[stat.key];

            return (
              <Card key={stat.key} className="bg-card/50 bg-white/10">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            );
          })}
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
              <Button
                variant="outline"
                className="border-primary/50 text-foreground hover:bg-primary/10"
              >
                <Car className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </Link>
            <Link to="/invoices">
              <Button
                variant="outline"
                className="bg-white/10 text-foreground hover:bg-secondary"
              >
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
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10"
              >
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentServices.map((service, index) => (
                <div
                  key={`${service.booking_id}-${index}`}
                  className="flex items-center justify-between p-4 bg-white/10 rounded-xl"
                >
                  <div>
                    <div className="font-semibold text-foreground">
                      {service.vehicle}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {service.service_type}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(service.preferred_date).toLocaleDateString(
                        "en-IN"
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge>{service.status.toUpperCase()}</Badge>
                    <div className="font-bold text-lg text-primary">
                      {service.total_amount ? `₹${service.total_amount}` : "—"}
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
