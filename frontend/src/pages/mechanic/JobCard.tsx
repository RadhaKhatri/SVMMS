import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Car, CheckCircle, Clock, Gauge, Mail, Phone, Plus, Save, Trash2, User, Wrench } from "lucide-react";

const JobCard = () => {
  const jobCard = {
    id: "JC-001",
    status: "in-service",
    customer: { name: "John Doe", phone: "+1 (555) 123-4567", email: "john@example.com" },
    vehicle: {
      make: "Toyota",
      model: "Camry",
      year: 2020,
      plate: "ABC1234",
      vin: "1HGBH41JXMN109186",
      mileage: "45,230 mi",
    },
    mechanic: { name: "Mike Johnson", id: "M-001", specialty: "Brake Systems" },
    service: "Brake Inspection & Repair",
    startTime: "2024-02-15 09:00 AM",
    estimatedCompletion: "2024-02-15 02:00 PM",
  };

  const tasks = [
    { id: 1, description: "Inspect brake pads", completed: true },
    { id: 2, description: "Replace front brake pads", completed: true },
    { id: 3, description: "Check brake fluid level", completed: false },
    { id: 4, description: "Test brake system", completed: false },
  ];

  const parts = [
    { id: 1, name: "Brake Pad Set (Front)", quantity: 1, cost: 89.99, stock: 15 },
    { id: 2, name: "Brake Fluid", quantity: 1, cost: 12.99, stock: 8 },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending": return { className: "bg-warning/20 text-warning border-warning/30", label: "PENDING" };
      case "in-service": return { className: "bg-primary/20 text-primary border-primary/30", label: "IN SERVICE" };
      case "completed": return { className: "bg-success/20 text-success border-success/30", label: "COMPLETED" };
      default: return { className: "bg-secondary text-secondary-foreground", label: status.toUpperCase() };
    }
  };

  const statusConfig = getStatusConfig(jobCard.status);

  return (
    <DashboardLayout role="mechanic">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-primary">{jobCard.id}</h1>
              <Badge className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">{jobCard.service}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white/10 hover:bg-secondary">
              <Save className="mr-2 h-4 w-4" />
              Save Progress
            </Button>
            <Button className="gradient-primary text-primary-foreground glow-primary">
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Job
            </Button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 bg-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4 text-primary" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="font-semibold text-lg text-foreground">{jobCard.customer.name}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                {jobCard.customer.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                {jobCard.customer.email}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 bg-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Car className="h-4 w-4 text-primary" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="font-semibold text-lg text-foreground">
                {jobCard.vehicle.year} {jobCard.vehicle.make} {jobCard.vehicle.model}
              </div>
              <div className="text-sm text-muted-foreground">
                Plate: <span className="font-mono text-primary">{jobCard.vehicle.plate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Gauge className="h-4 w-4 text-primary" />
                {jobCard.vehicle.mileage}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 bg-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Started: </span>
                <span className="font-medium text-foreground">{jobCard.startTime}</span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Est. Completion: </span>
                <span className="font-medium text-primary">{jobCard.estimatedCompletion}</span>
              </div>
              <div className="pt-2">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="h-2 rounded-full gradient-primary" style={{ width: "50%" }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tasks">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Tasks</TabsTrigger>
            <TabsTrigger value="parts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Parts Used</TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4 mt-6">
            <Card className="bg-card/50 bg-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Task Checklist</CardTitle>
                <Button size="sm" className="gradient-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      task.completed 
                        ? "bg-success/5 border-success/20" 
                        : "bg-secondary/30 bg-white/10 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={task.completed}
                        className="h-5 w-5 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <span className={task.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"}>
                        {task.description}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parts" className="space-y-4 mt-6">
            <Card className="bg-card/50 bg-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Parts & Materials</CardTitle>
                <Button size="sm" className="gradient-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Part
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {parts.map((part) => (
                    <div
                      key={part.id}
                      className="flex items-center justify-between p-4 bg-secondary/30 border bg-white/10 rounded-xl hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Wrench className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{part.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Qty: {part.quantity} | Stock: <span className="text-primary">{part.stock}</span> available
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg text-primary">${part.cost.toFixed(2)}</span>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t bg-white/10 flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total Parts Cost:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${parts.reduce((sum, p) => sum + p.cost * p.quantity, 0).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-6">
            <Card className="bg-card/50 bg-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Work Notes & Comments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="notes" className="text-foreground">Add Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Document any findings, issues, or additional work needed..."
                    rows={4}
                    className="bg-secondary/50 bg-white/10 focus:border-primary"
                  />
                  <Button className="gradient-primary text-primary-foreground">Save Note</Button>
                </div>
                <div className="pt-4 border-t bg-white/10 space-y-3">
                  <div className="p-4 bg-secondary/30 border bg-white/10 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">Mike Johnson</span>
                      </div>
                      <span className="text-xs text-muted-foreground">2024-02-15 10:30 AM</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Front brake pads were worn down to 2mm. Replaced with new set.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default JobCard;
