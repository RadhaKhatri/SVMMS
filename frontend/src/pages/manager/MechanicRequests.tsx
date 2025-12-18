import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PendingMechanic {
  id: number;
  mechanic: string;
  center: string;
}

interface ApprovedMechanic {
  id: number;
  name: string;
  availability_status: string;
}

const ManagerMechanics = () => {
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  const [pending, setPending] = useState<PendingMechanic[]>([]);
  const [approved, setApproved] = useState<ApprovedMechanic[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMechanics = async () => {
    try { 
      const [pendingRes, approvedRes] = await Promise.all([
        axios.get("http://localhost:5000/api/manager/mechanics/requests", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/manager/mechanics", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPending(pendingRes.data);
      setApproved(approvedRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load mechanics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  const approveMechanic = async (id: number) => {
    try {
      await axios.post(
        `http://localhost:5000/api/manager/mechanics/requests/${id}/approve`,
  {},
  { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({ title: "Mechanic Approved" });
      fetchMechanics();
    } catch {
      toast({
        title: "Error",
        description: "Approval failed",
        variant: "destructive",
      });
    }
  };

  const rejectMechanic = async (id: number) => {
    try {
      await axios.post(
        `http://localhost:5000/api/manager/mechanics/requests/${id}/reject`,
  {},
  { headers: { Authorization: `Bearer ${token}` } }
      );

      toast({
        title: "Mechanic Rejected",
        variant: "destructive",
      });
      fetchMechanics();
    } catch {
      toast({
        title: "Error",
        description: "Rejection failed",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="manager">
        <div className="p-6">Loading mechanics...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="manager">
      <div className="p-6 space-y-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold">Mechanics Management</h1>

        {/* 🔴 Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Mechanic Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.length === 0 && (
              <p className="text-muted-foreground">No pending requests</p>
            )}

            {pending.map((m) => (
              <div
                key={m.id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <div>
                  <div className="font-semibold">{m.mechanic}</div>
                  <div className="text-sm text-muted-foreground">
                    Requested Center: {m.center}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => approveMechanic(m.id)}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => rejectMechanic(m.id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 🟢 Approved Mechanics */}
        <Card>
          <CardHeader>
            <CardTitle>Approved Mechanics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {approved.length === 0 && (
              <p className="text-muted-foreground">No approved mechanics</p>
            )}

            {approved.map((m) => (
              <div
                key={m.id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Status: {m.availability_status}
                  </div>
                </div>

                <Badge variant="secondary">APPROVED</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerMechanics;
