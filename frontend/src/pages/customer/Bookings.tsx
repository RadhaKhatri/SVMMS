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

const Bookings = () => {
  
  const [bookings, setBookings] = useState([]);

const fetchBookings = async () => {
  const res = await axios.get("http://localhost:5000/api/bookings", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  setBookings(res.data);
};

useEffect(() => {
  fetchBookings();
}, []);

const token = localStorage.getItem("token");

const [form, setForm] = useState({
  vehicle_id: "",
  service_type: "",
  preferred_date: "",
  preferred_time: "",
  remarks: ""
});

const handleBookingSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await axios.post(
      "http://localhost:5000/api/bookings",
      {
        vehicle_id: form.vehicle_id,
        service_center_id: 1, // default
        service_type: form.service_type,
        preferred_date: form.preferred_date,
        preferred_time: form.preferred_time,
        remarks: form.remarks
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    fetchBookings();
  } catch (error) {
    console.error("Booking failed:", error);
  }
};


  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending": return { 
        icon: Clock, 
        className: "bg-warning/20 text-warning border-warning/30",
        label: "PENDING"
      };
      case "approved": return { 
        icon: CheckCircle, 
        className: "bg-primary/20 text-primary border-primary/30",
        label: "APPROVED"
      };
      case "completed": return { 
        icon: CheckCircle, 
        className: "bg-success/20 text-success border-success/30",
        label: "COMPLETED"
      };
      case "cancelled": return { 
        icon: AlertCircle, 
        className: "bg-destructive/20 text-destructive border-destructive/30",
        label: "CANCELLED"
      };
      default: return { 
        icon: Clock, 
        className: "bg-secondary text-secondary-foreground border-border",
        label: status.toUpperCase()
      };
    }
  };

  return (
    <DashboardLayout role="customer">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Service <span className="text-primary">Bookings</span></h1>
            <p className="text-muted-foreground mt-1">View and manage your service appointments</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground glow-primary">
                <Plus className="mr-2 h-4 w-4" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card bg-white/10">
              <DialogHeader>
                <DialogTitle className="text-2xl">Book a Service</DialogTitle>
                <DialogDescription>Fill in the details for your service appointment</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBookingSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Select Vehicle</Label>
                  <Select
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, vehicle_id: value }))
                    }
                  >

                    <SelectTrigger className="bg-secondary/50 bg-white/10">
                      <SelectValue placeholder="Choose a vehicle" />
                    </SelectTrigger>
                    <SelectContent className="bg-card bg-white/10">
                      <SelectItem value="1">2020 Toyota Camry - ABC1234</SelectItem>
                      <SelectItem value="2">2019 Honda Civic - XYZ5678</SelectItem>
                      <SelectItem value="3">2021 Ford F-150 - DEF9012</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service Type</Label>
                  <Select
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, service_type: value }))
                    }
                  >

                    <SelectTrigger className="bg-secondary/50 bg-white/10">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent className="bg-card bg-white/10">
                      <SelectItem value="oil">Oil Change</SelectItem>
                      <SelectItem value="brake">Brake Service</SelectItem>
                      <SelectItem value="tire">Tire Rotation</SelectItem>
                      <SelectItem value="inspection">General Inspection</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Preferred Date</Label>
                    <Input
                      type="date"
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
                      value={form.preferred_time}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, preferred_time: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    value={form.remarks}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, remarks: e.target.value }))
                    }
                  />

                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground">Submit Booking Request</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bookings Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Bookings</TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Pending</TabsTrigger>
            <TabsTrigger value="approved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Approved</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {bookings.map((booking) => {
              const statusConfig = getStatusConfig(booking.status);
              const StatusIcon = statusConfig.icon;
              return (
                <Card key={booking.id} className="bg-card/50 bg-white/10 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                  <div className="h-1 gradient-primary" />
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl">
                              <Car className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-foreground">{booking.service_type}</h3>
                              <p className="text-sm text-muted-foreground">{booking.preferred_date} at {booking.preferred_time}

</p>
                            </div>
                          </div>
                          <Badge className={statusConfig.className}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm pl-16">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{booking.preferred_date} at {booking.preferred_time}</span>
                          </div>
                          {booking.mechanic && (
                            <div className="text-muted-foreground">
                              <span>Mechanic: </span>
                              <span className="font-medium text-foreground">{booking.mechanic}</span>
                            </div>
                          )}
                          {booking.amount && (
                            <div className="font-bold text-primary text-lg">{booking.amount}</div>
                          )}
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground pl-16 italic">{booking.remarks}</p>
                        )}
                      </div>
                      <div className="ml-4 flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white/10 hover:bg-secondary">View Details</Button>
                        {booking.status === "completed" && (
                          <Button size="sm" className="gradient-primary text-primary-foreground">View Invoice</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card className="bg-card/50 bg-white/10">
              <CardContent className="pt-6 text-center text-muted-foreground py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                <p>Filter showing pending bookings only</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <Card className="bg-card/50 bg-white/10">
              <CardContent className="pt-6 text-center text-muted-foreground py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                <p>Filter showing approved bookings only</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <Card className="bg-card/50 bg-white/10">
              <CardContent className="pt-6 text-center text-muted-foreground py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success/50" />
                <p>Filter showing completed bookings only</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Bookings;
