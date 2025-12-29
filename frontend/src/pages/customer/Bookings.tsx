import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Calendar, Car, CheckCircle, Clock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useLocation } from "react-router-dom";
import { socket } from "@/lib/socket";

const Bookings = () => {  
  
    /* ================= STATES ================= */
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
const [selectedBooking, setSelectedBooking] = useState<any>(null);
const [detailsOpen, setDetailsOpen] = useState(false);
const location = useLocation();
const [open, setOpen] = useState(false);
const [taskProgress, setTaskProgress] = useState<Record<number, any>>({});
const [jobProgress, setJobProgress] = useState<any>(null);


const token = localStorage.getItem("token");

const fetchBookings = async () => {
  const res = await axios.get("http://localhost:5000/api/bookings", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  setBookings(res.data);
};

const fetchVehicles = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/vehicles/my",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setVehicles(res.data);
  } catch (err) {
    console.error("Vehicle fetch error:", err);
  }
};

const fetchServices = async () => {
  try {
    const res = await axios.get(
      "http://localhost:5000/api/services",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setServices(res.data);
  } catch (err) {
    console.error("Service fetch error:", err);
  }
};


   const fetchCenters = async () => {
    const res = await axios.get("http://localhost:5000/api/service-centers");
    setCenters(res.data);
  };

  useEffect(() => {
  if (!token) return;
  fetchBookings();
  fetchVehicles();
  fetchServices();
  fetchCenters();
}, [token]);

useEffect(() => {
  if (location.state?.vehicleId) {
    setOpen(true);
    setForm((prev) => ({
      ...prev,
      vehicle_id: String(location.state.vehicleId)
    }));
  }
}, [location.state]);

useEffect(() => {
  const customerId = localStorage.getItem("user_id");
  if (!customerId) return;

  socket.emit("join-customer", customerId);

  const handler = (data: any) => {
  setBookings((prev) =>
    prev.map((b) =>
      b.id === data.bookingId ? { ...b, status: data.status } : b
    )
  );

  // 🔥 ALSO sync task progress when completed
  if (data.status === "completed") {
    setTaskProgress((prev) => ({
      ...prev,
      [data.bookingId]: {
        completed: prev[data.bookingId]?.total || 0,
        total: prev[data.bookingId]?.total || 0,
      },
    }));
  }
};

  socket.on("booking-status-updated", handler);

  return () => {
    socket.off("booking-status-updated", handler);
  };
}, []);


const initialFormState = {
  vehicle_id: "",
  service_center_id: "",
  preferred_date: "",
  preferred_time: "",
  remarks: ""
};


const [form, setForm] = useState(initialFormState);

const filteredBookings =
  activeTab === "all"
    ? bookings
    : bookings.filter((b) => b.status === activeTab);


const handleBookingSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await axios.post(
      "http://localhost:5000/api/bookings",
      {
            vehicle_id: Number(form.vehicle_id),
    service_center_id: Number(form.service_center_id),
    preferred_date: form.preferred_date,
    preferred_time: form.preferred_time,
    remarks: form.remarks,
    services: selectedServices.map(Number)
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    toast({
      title: "Booking Successful 🎉",
      description: "Your service booking has been submitted successfully.",
    });
    // 🔥 RESET FORM + SERVICES
      setForm(initialFormState);
      setSelectedServices([]);

    fetchBookings();
    setOpen(false);
  } catch (error) {
    console.error("Booking failed:", error);
     toast({
      title: "Booking Failed ❌",
      description:
        error.response?.data?.message ||
        "Something went wrong. Please try again.",
      variant: "destructive",
    });
  }
};

const handleViewDetails = async (id: number) => {
  try {
    const [bookingRes, progressRes] = await Promise.all([
  axios.get(`http://localhost:5000/api/bookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
  axios.get(`http://localhost:5000/api/bookings/${id}/job-progress`, {
    headers: { Authorization: `Bearer ${token}` }
  })
]);

setSelectedBooking(bookingRes.data);
setJobProgress(progressRes.data);
setDetailsOpen(true);

  } catch (err) {
    toast({
      title: "Failed to load booking",
      variant: "destructive",
    });
  }
};
const handleCancelBooking = async (id: number) => {
  try {
    await axios.patch(
      `http://localhost:5000/api/bookings/${id}/cancel`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    toast({ title: "Booking cancelled" });
    fetchBookings();
    setOpen(false);
  } catch (err) {
    toast({
      title: "Cancel failed",
      variant: "destructive",
    });
  }
};


   /* ================= STATUS UI ================= */

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          className: "bg-warning/20 text-warning border-warning/30",
          label: "PENDING"
        };
      case "approved":
        return {
          icon: CheckCircle,
          className: "bg-primary/20 text-primary border-primary/30",
          label: "APPROVED"
        };
      case "completed":
        return {
          icon: CheckCircle,
          className: "bg-success/20 text-success border-success/30",
          label: "COMPLETED"
        };
      case "cancelled":
        return {
          icon: AlertCircle,
          className: "bg-destructive/20 text-destructive border-destructive/30",
          label: "CANCELLED"
        };
      default:
        return {
          icon: Clock,
          className: "bg-secondary text-secondary-foreground border-border",
          label: status.toUpperCase()
        };
    }
  };

  const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute));
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const fetchTaskProgress = async (bookingId: number) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/bookings/${bookingId}/task-progress`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setTaskProgress(prev => ({
      ...prev,
      [bookingId]: {
        completed: Number(res.data.completed),
        total: Number(res.data.total),
      }
    }));
  } catch (err) {
    // silently ignore if job card not created yet
    console.warn(`No task progress for booking ${bookingId}`);
  }
};


useEffect(() => {
  if (!token) return;

  bookings.forEach((b) => {
    if (
      (b.status === "approved" || b.status === "completed") &&
      !taskProgress[b.id]
    ) {
      fetchTaskProgress(b.id);
    }
  });
}, [bookings, token]);


useEffect(() => {
  const handler = (data: any) => {
    if (data.bookingId !== selectedBooking?.id) return;

    setJobProgress((prev: any) => ({
      ...prev,
      tasks: prev.tasks.map((t: any) =>
        t.id === data.taskId ? { ...t, status: data.status } : t
      ),
      summary: data.summary
    }));
  };

  socket.on("job-task-updated", handler);

  return () => {
  socket.off("job-task-updated", handler);
};

}, [selectedBooking]);


  return (
    <DashboardLayout role="customer">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Service <span className="text-primary">Bookings</span></h1>
            <p className="text-muted-foreground mt-1">View and manage your service appointments</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground glow-primary">
                <Plus className="mr-2 h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl h-[90vh] flex flex-col bg-card bg-black/100 border border-white overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Book a Service</DialogTitle>
                <DialogDescription>Fill in the details for your service appointment</DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleBookingSubmit} className="">
                <div>
                <div className="space-y-1">
                  <Label htmlFor="vehicle">Select Vehicle</Label>
                  <Select
  value={form.vehicle_id}
  onValueChange={(value) =>
    setForm((p) => ({ ...p, vehicle_id: value }))
  }
>

                    <SelectTrigger className="bg-secondary/50 bg-white/10 focus:ring-0 focus:border-white">
                      <SelectValue placeholder="Choose a vehicle" />
                    </SelectTrigger>
                    <SelectContent className="bg-card bg-black/100" >
                      {vehicles.map((v) => (
                        <SelectItem key={v.id} value={String(v.id)}>
                          {v.year} {v.make} {v.model} - {v.vin}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* SERVICE CENTER */}
                <div className="space-y-2">
                  <Label>Select Service Center</Label>
                  <Select
                    onValueChange={(value) =>
                      setForm((p) => ({ ...p, service_center_id: value }))
                    }
                  >
                    <SelectTrigger className="bg-white/10 focus:ring-0 focus:border-white">
                      <SelectValue placeholder="Choose service center" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/100">
                      {centers.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name} ({c.city})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                 {/* SERVICES */}
                <div className="space-y-2 ">
                  <Label>Select Services</Label>
                  {services.map((s) => (
                    <label key={s.id} className="flex items-center gap-2  ">
                      <input
                          type="checkbox"
                          value={s.id}
                          checked={selectedServices.includes(s.id)}
                          onChange={(e) => {
                            const id = Number(e.target.value);
                            setSelectedServices((prev) =>
                              prev.includes(id)
                                ? prev.filter((x) => x !== id)
                                : [...prev, id]
                            );
                          }}
                        />

                      <span>{s.name}</span>
                    </label>
                  ))}
                </div>

                {/* ADD NEW SERVICE */}
                <Input
                  placeholder="Add new service & press Enter"
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const name = e.currentTarget.value;

                      const res = await axios.post(
                        "http://localhost:5000/api/services",
                        { name },
                        {
                          headers: {
                            Authorization: `Bearer ${token}`
                          }
                        }
                      );

                      setServices((prev) => [...prev, res.data]);
                      e.currentTarget.value = "";
                    }
                  }}
                />
          
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Preferred Date</Label>
                    <Input
                      type="date"
                      className="bg-white text-black dark:bg-white/10 dark:text-white"
                      value={form.preferred_date}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, preferred_date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Preferred Time</Label>
                    <Input
                        type="time"
                        className="bg-white text-black dark:bg-white/10 dark:text-white"
                        value={form.preferred_time}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, preferred_time: e.target.value }))
                        }
                      />
                  </div>
                </div>
                <div className="space-y-2 ">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    value={form.remarks}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, remarks: e.target.value }))
                    }
                  />
                  </div>
                </div>
                <div className="pt-4 border-t bg-background">
                <Button type="submit" className="w-full gradient-primary text-primary-foreground">Submit Booking Request</Button>
              </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bookings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="all">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Bookings</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pending</TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Approved</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
  {filteredBookings.length === 0 ? (
    <Card className="bg-card/50 bg-white/10">
      <CardContent className="pt-6 text-center text-muted-foreground py-12">
        <Clock className="h-12 w-12 mx-auto mb-4 text-primary/50" />
        <p>No bookings found</p>
      </CardContent>
    </Card>
  ) : (
    filteredBookings.map((booking) => {
      const statusConfig = getStatusConfig(booking.status);
      const StatusIcon = statusConfig.icon;

      return (
        <Card
          key={booking.id}
          className="bg-card/50 bg-black/10 hover:border-primary/30 transition-all"
        >

          <CardContent className="pt-6">
            
            {taskProgress[booking.id] &&
 booking.status !== "pending" &&
 booking.status !== "cancelled" && (
  <p className="text-sm text-muted-foreground mt-1">
    🔧 {taskProgress[booking.id].completed} / {taskProgress[booking.id].total} tasks completed
  </p>
)}


            <div className="flex justify-between">
              <div className="space-y-2">
                <h3 className="font-bold">
                  {booking.make} {booking.model} ({booking.year})
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(booking.preferred_date)} at {formatTime(booking.preferred_time)}
                </p>

                                {/* SERVICES */}
                {booking.services?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {booking.services.map((service: string) => (
                      <Badge
                        key={`${booking.id}-${service}`}
                        variant="outline"
                        className="bg-white/10 text-foreground border-primary/30"
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                )}

                <Badge className={statusConfig.className}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetails(booking.id)}
                >
                  View Details
                </Button>

                {booking.status === "pending" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    })
  )}
</TabsContent>

<Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Booking Details</DialogTitle>
    </DialogHeader>

    {selectedBooking && (
      <div className="space-y-2 text-sm">
        <p><b>Vehicle:</b> {selectedBooking.make} {selectedBooking.model}</p>
        <p><b>Service Center:</b> {selectedBooking.service_center}</p>
        <p><b>Status:</b> {selectedBooking.status}</p>
        <p><b>Services:</b> {selectedBooking.services.join(", ")}</p>
        <p><b>Remarks:</b> {selectedBooking.remarks || "-"}</p>
      </div>
    )}

    {jobProgress?.jobStarted ? (
  <div className="space-y-4">

    {/* PROGRESS BAR */}
    <div>
      <p className="text-sm mb-1">
        Service Progress {jobProgress.summary.completed} / {jobProgress.summary.total}
      </p>
      <div className="w-full h-2 bg-gray-200 rounded">
        <div
          className="h-2 bg-green-500 rounded transition-all"
          style={{
            width: `${(jobProgress.summary.completed / jobProgress.summary.total) * 100}%`
          }}
        />
      </div>
    </div>

    {/* TASK LIST */}
    <div className="space-y-2">
      {jobProgress.tasks.map((task: any) => (
        <div key={task.id} className="flex items-center gap-2">
          <span
            className={
              task.status === "completed"
                ? "text-green-600"
                : task.status === "in_progress"
                ? "text-yellow-500"
                : "text-gray-400"
            }
          >
            ●
          </span>
          {task.service_name} — {task.status}
        </div>
      ))}
    </div>

  </div>
) : (
  <p className="text-muted-foreground">
    Job not started yet
  </p>
)}

  </DialogContent>
</Dialog>

        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Bookings;
