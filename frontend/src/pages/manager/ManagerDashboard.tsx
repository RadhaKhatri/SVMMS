import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Users, Clock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ServiceCenterModal from "@/components/manager/ServiceCenterModal";
import { useNavigate } from "react-router-dom";


const ManagerDashboard = () => {

  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
const [mechanics, setMechanics] = useState<any[]>([]);

const [selectedBooking, setSelectedBooking] = useState<any>(null);
const [selectedMechanic, setSelectedMechanic] = useState<number | null>(null);
const [showServiceCenterModal, setShowServiceCenterModal] = useState(false);
const navigate = useNavigate();
const { toast } = useToast();


const fetchPendingBookings = async () => {
  const res = await axios.get(
    "http://localhost:5000/api/manager/bookings/pending",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  setPendingBookings(res.data);
  setStats((prev) => ({
    ...prev,
    pending: res.data.length,
  }));
};


const fetchMechanics = async () => {
  const res = await axios.get(
    "http://localhost:5000/api/manager/mechanics",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  setMechanics(res.data);
  setStats((prev) => ({
    ...prev,
    activeMechanics: res.data.length,
  }));
};


const rejectBooking = async (id: number) => {
  try {
    await axios.post(
      `http://localhost:5000/api/manager/bookings/${id}/reject`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    toast({
      title: "Booking Rejected",
      description: "The booking has been rejected successfully.",
    });

    fetchPendingBookings();
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to reject booking",
      variant: "destructive",
    });
  }
};


const approveBooking = async () => {
  if (!selectedBooking || !selectedMechanic) return;

 await axios.post(
  `http://localhost:5000/api/manager/bookings/${selectedBooking.id}/approve`,
  { mechanic_id: selectedMechanic },  
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);


  setSelectedBooking(null);
  setSelectedMechanic(null);
  fetchPendingBookings();
  await fetchMechanics();  
};
const [stats, setStats] = useState({
  pending: 0,
  activeMechanics: 0,
  inProgress: 0,
  completedToday: 0,
});


const [serviceCenter, setServiceCenter] = useState<any>(null);
const fetchServiceCenter = async () => {
  const res = await axios.get(
    "http://localhost:5000/api/manager/service-center",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );
  setServiceCenter(res.data);
};

const fetchDashboardStats = async () => {
  const res = await axios.get(
    "http://localhost:5000/api/manager/dashboard-stats",  
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  setStats((prev) => ({
    ...prev,
    inProgress: res.data.inProgress,
    completedToday: res.data.completedToday,
  }));
};


useEffect(() => {
  fetchPendingBookings();
  fetchMechanics();
  fetchServiceCenter(); 
  fetchDashboardStats();
}, []);


  return (

 <>
    <DashboardLayout role="manager">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Service Manager Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage bookings, mechanics, and workflow
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 ">
            <Button
  onClick={() => {
    if (serviceCenter) {
      toast({
        title: "Service Center Already Registered",
        description:
          "You already have a service center. Go to Profile to edit details.",
        variant: "default",
      });
    } else {
      setShowServiceCenterModal(true);
    }
  }}
  className="text-black "
>
  {serviceCenter ? "Service Center Registered" : "Register Service Center"}
</Button>


  <Button className="border border-white"
    variant="outline"
    onClick={() => navigate("/manager/job-cards")}
  >
    Job Cards
  </Button>
            <Button className="border border-white"
              variant="outline"
              onClick={() => navigate("/manager/profile")}
            >
              Profile
            </Button>
          </div>
        </div>

        {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
            <Card className="border border-white/30">
              <CardHeader className="flex justify-between items-center ">
                <CardTitle className="text-sm">Pending Approvals</CardTitle>
                <FileText className="h-5 w-5 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card className="border border-white/30">
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-sm">Active Mechanics</CardTitle>
                <Users className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.activeMechanics}</div>
              </CardContent>
            </Card>

            <Card className="border border-white/30">
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-sm">In Progress</CardTitle>
                <Clock className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.inProgress}</div>
              </CardContent>
            </Card>

            <Card className="border border-white/30">
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-sm">Completed Today</CardTitle>
                <CheckCircle className="h-5 w-5 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.completedToday}</div>
              </CardContent>
            </Card>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Bookings */}
          <Card className="border border-white/20">
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{booking.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{booking.make} {booking.model} ({booking.year})</div>
                        <div className="text-sm font-medium mt-1">Services: {booking.services?.join(", ")}</div>

                    </div>
                    <Badge variant={booking.priority === "high" ? "destructive" : "secondary"}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {booking.preferred_date} at {booking.preferred_time}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        Approve
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => rejectBooking(booking.id)}
                      >
                        Reject
                      </Button>

                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Available Mechanics */}
          <Card className="border border-white/20">
            <CardHeader>
              <CardTitle>Mechanic Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mechanics.map((mechanic) => (
                <div key={mechanic.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold">{mechanic.name}</div>
                      <div className="text-sm text-muted-foreground">Hourly Rate: ₹{mechanic.hourly_rate || "N/A"}</div>
                    </div>
                    <Badge className="border-white"
                        variant={
                          mechanic.availability_status === "available"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {mechanic.availability_status}
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

      <Dialog
          open={!!selectedBooking}
          onOpenChange={() => setSelectedBooking(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Mechanic</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {mechanics.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMechanic(m.id)}
                  className={`p-3 border rounded cursor-pointer ${
                    selectedMechanic === m.id ? "border-primary" : ""
                  }`}
                >
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Status: {m.availability_status}
                  </div>
                </div>
              ))}
            </div>

            <Button
              className="w-full mt-4"
              onClick={approveBooking}
              disabled={!selectedMechanic}
            >
              Confirm & Create Job Card
            </Button>
          </DialogContent>
        </Dialog>

    </DashboardLayout>
    {showServiceCenterModal && (
      <ServiceCenterModal
        open={showServiceCenterModal}
        onClose={() => setShowServiceCenterModal(false)}
        onSuccess={() => {
          setShowServiceCenterModal(false);
          fetchServiceCenter();
        }}
      />
    )}
  </>
  );
};

export default ManagerDashboard;
