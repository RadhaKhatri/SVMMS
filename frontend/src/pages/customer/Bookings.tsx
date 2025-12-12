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

const Bookings = () => {
  const bookings = [
    {
      id: 1,
      vehicle: "2020 Toyota Camry - ABC1234",
      service: "Oil Change & Filter Replacement",
      date: "2024-02-15",
      time: "10:00 AM",
      status: "pending",
      notes: "Requested by customer for regular maintenance",
    },
    {
      id: 2,
      vehicle: "2019 Honda Civic - XYZ5678",
      service: "Brake Inspection & Repair",
      date: "2024-02-10",
      time: "2:00 PM",
      status: "approved",
      mechanic: "Mike Johnson",
    },
    {
      id: 3,
      vehicle: "2021 Ford F-150 - DEF9012",
      service: "Annual Inspection",
      date: "2024-01-25",
      time: "9:00 AM",
      status: "completed",
      mechanic: "Sarah Williams",
      amount: "$249.99",
    },
  ];

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
              <form className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Select Vehicle</Label>
                  <Select>
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
                  <Select>
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
                    <Input id="date" type="date" className="bg-secondary/50 bg-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Preferred Time</Label>
                    <Input id="time" type="time" className="bg-secondary/50 bg-white/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" placeholder="Any specific concerns or requests..." rows={3} className="bg-secondary/50 bg-white/10" />
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
                              <h3 className="text-lg font-bold text-foreground">{booking.service}</h3>
                              <p className="text-sm text-muted-foreground">{booking.vehicle}</p>
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
                            <span>{booking.date} at {booking.time}</span>
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
                          <p className="text-sm text-muted-foreground pl-16 italic">{booking.notes}</p>
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
