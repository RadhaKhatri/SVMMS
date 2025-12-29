import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ServiceCenter {
  id: number;
  name: string;
  city: string;
  status: "pending" | "approved" | "rejected" | null;
}

const ServiceCenterRequests = () => {
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all service centers + request status
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/mechanic/request-center", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCenters(res.data))
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to load service centers",
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  // Send request
  const requestCenter = async (id: number) => {
    try {
      await axios.post(
        `http://localhost:5000/api/mechanic/request-center/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "Request Sent",
        description: "Your request is pending approval.",
      });

      setCenters((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: "pending" } : c
        )
      );
    } catch {
      toast({
        title: "Failed",
        description: "Could not send request",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="mechanic">
        <p className="p-6">Loading service centers...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="mechanic">
      <div className="p-6 space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Service Centers</h1>

        {centers.map((center) => (
          <Card key={center.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {center.name} <span className="text-muted-foreground">({center.city})</span>
              </CardTitle>

              {center.status ? (
                <Badge
                  variant={
                    center.status === "approved"
                      ? "secondary"
                      : center.status === "rejected"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {center.status.toUpperCase()}
                </Badge>
              ) : (
                <Button size="sm" onClick={() => requestCenter(center.id)}>
                  Request
                </Button>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ServiceCenterRequests;
