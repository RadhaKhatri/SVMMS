import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Car, Gauge, Plus, Wrench } from "lucide-react";

const Vehicles = () => {
  const vehicles = [
    {
      id: 1,
      make: "Toyota",
      model: "Camry",
      year: 2020,
      plate: "ABC1234",
      vin: "1HGBH41JXMN109186",
      color: "Silver",
      mileage: "45,230 mi",
      lastService: "2024-01-15",
      nextService: "2024-04-15",
      status: "active",
    },
    {
      id: 2,
      make: "Honda",
      model: "Civic",
      year: 2019,
      plate: "XYZ5678",
      vin: "2HGFC2F59MH123456",
      color: "Blue",
      mileage: "38,500 mi",
      lastService: "2024-01-10",
      nextService: "2024-04-10",
      status: "active",
    },
    {
      id: 3,
      make: "Ford",
      model: "F-150",
      year: 2021,
      plate: "DEF9012",
      vin: "1FTEW1EP1MKF12345",
      color: "Black",
      mileage: "28,100 mi",
      lastService: "2023-12-20",
      nextService: "2024-03-20",
      status: "service-due",
    },
  ];

  return (
    <DashboardLayout role="customer">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My <span className="text-primary">Vehicles</span></h1>
            <p className="text-muted-foreground mt-1">Manage your registered vehicles</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground glow-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card bg-white/10">
              <DialogHeader>
                <DialogTitle className="text-2xl">Add New Vehicle</DialogTitle>
                <DialogDescription>Enter your vehicle details below</DialogDescription>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input id="make" placeholder="Toyota" className="bg-secondary/50 bg-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input id="model" placeholder="Camry" className="bg-secondary/50 bg-white/10" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input id="year" type="number" placeholder="2020" className="bg-secondary/50 bg-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" placeholder="Silver" className="bg-secondary/50 bg-white/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plate">License Plate</Label>
                  <Input id="plate" placeholder="ABC1234" className="bg-secondary/50 bg-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN Number</Label>
                  <Input id="vin" placeholder="1HGBH41JXMN109186" className="bg-secondary/50 bg-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Current Mileage</Label>
                  <Input id="mileage" type="number" placeholder="45000" className="bg-secondary/50 bg-white/10" />
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground">Add Vehicle</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Vehicle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className="bg-card/50 bg-white/10 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group overflow-hidden">
              {/* Card Header Accent */}
              <div className="h-1 gradient-primary" />
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                      <Car className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-foreground">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </CardTitle>
                      <p className="text-sm text-primary font-mono">{vehicle.plate}</p>
                    </div>
                  </div>
                  <Badge 
                    className={
                      vehicle.status === "active" 
                        ? "bg-success/20 text-success border-success/30" 
                        : "bg-warning/20 text-warning border-warning/30"
                    }
                  >
                    {vehicle.status === "active" ? "Active" : "Service Due"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">Color</span>
                    <span className="font-medium text-foreground">{vehicle.color}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Gauge className="h-4 w-4" /> Mileage
                    </span>
                    <span className="font-medium text-foreground">{vehicle.mileage}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">VIN</span>
                    <span className="font-mono text-xs text-muted-foreground">{vehicle.vin}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-border/30 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Service:</span>
                    <span className="font-medium text-foreground">{vehicle.lastService}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wrench className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Next Service:</span>
                    <span className="font-medium text-primary">{vehicle.nextService}</span>
                  </div>
                </div>
                <div className="pt-4 flex gap-2">
                  <Button variant="outline" className="flex-1 bg-white/10 hover:bg-secondary" size="sm">
                    View Details
                  </Button>
                  <Button className="flex-1 gradient-primary text-primary-foreground" size="sm">
                    Book Service
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Vehicles;
