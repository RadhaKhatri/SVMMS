import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Car, DollarSign, TrendingUp, Users, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = [
  "hsl(195, 100%, 50%)",
  "hsl(210, 100%, 60%)",
  "hsl(142, 76%, 45%)",
  "hsl(38, 92%, 55%)",
  "hsl(215, 35%, 40%)",
];

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [serviceData, setServiceData] = useState<any[]>([]);
  const [topMechanics, setTopMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "http://localhost:5000/api/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(res.data.stats);
        setRevenueData(res.data.revenueTrend);
        setServiceData(res.data.serviceDistribution);
        setTopMechanics(res.data.topMechanics);
      } catch (error) {
        console.error("Failed to load admin dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsConfig = stats
    ? [
        {
          title: "Total Revenue",
          value: `₹${Number(stats.totalRevenue).toLocaleString()}`,
          icon: DollarSign,
        },
        {
          title: "Active Customers",
          value: stats.activeCustomers,
          icon: Users,
        },
        {
          title: "Vehicles Serviced",
          value: stats.vehiclesServiced,
          icon: Car,
        },
        {
          title: "Services Completed",
          value: stats.servicesCompleted,
          icon: Wrench,
        },
      ]
    : [];

  if (loading) {
    return (
      <DashboardLayout role="admin">
        <div className="p-6 text-center text-muted-foreground">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete overview of your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsConfig.map((stat, idx) => (
            <Card
              key={idx}
              className="bg-card/50 bg-white/10 hover:border-primary/30 transition-all group"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-success mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {stat.value} from last
                  month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/50 bg-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(215, 35%, 20%)"
                  />
                  <XAxis dataKey="month" stroke="hsl(215, 20%, 55%)" />
                  <YAxis stroke="hsl(215, 20%, 55%)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(215, 45%, 12%)",
                      border: "1px solid hsl(215, 35%, 20%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(195, 100%, 50%)"
                    strokeWidth={3}
                    dot={{ fill: "hsl(195, 100%, 50%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card/50 bg-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Service Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    dataKey="value"
                  >
                    {serviceData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(215, 45%, 12%)",
                      border: "1px solid hsl(215, 35%, 20%)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/50 bg-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Mechanics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topMechanics.map((mechanic, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-secondary/30 border bg-white/10 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full gradient-primary text-primary-foreground font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {mechanic.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {mechanic.completed} services completed
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {mechanic.rating}
                  </div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
