import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Car, Edit, Gauge, Plus, Trash, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const { toast } = useToast();
  const [form, setForm] = useState({
    vin: "",
    make: "",
    model: "",
    year: "",
    engine_type: "",
    mileage: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [services, setServices] = useState({});
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/vehicles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(res.data);
    } catch (err) {
      setMessage("Failed to fetch vehicles");
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Validate form
  const validate = () => {
    const errs: any = {};
    if (!form.vin.trim()) errs.vin = "VIN is required";
    if (!form.make.trim()) errs.make = "Make is required";
    if (!form.model.trim()) errs.model = "Model is required";
    if (!form.engine_type.trim()) errs.engine_type = "Engine type is required";
    if (!form.year || isNaN(Number(form.year)))
      errs.year = "Year must be a number";
    if (!form.mileage || isNaN(Number(form.mileage)))
      errs.mileage = "Mileage must be a number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Add or Update Vehicle
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      let res;
      if (editingVehicle) {
        res = await axios.put(
          `http://localhost:5000/api/vehicles/${editingVehicle.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast({
          title: "Vehicle Updated ✅",
          description: "Your vehicle details were updated successfully",
        });
        setMessage(res.data.message);
        setEditingVehicle(null);
      } else {
        res = await axios.post("http://localhost:5000/api/vehicles", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({
          title: "Vehicle Updated ✅",
          description: "Your vehicle details were added successfully",
        });
        setMessage(res.data.message);
      }
      setForm({
        vin: "",
        make: "",
        model: "",
        year: "",
        engine_type: "",
        mileage: "",
      });
      fetchVehicles();
    } catch (error: any) {
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Server error. Check your inputs.");
      }
    }
  };

  // Edit Vehicle
  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setForm({
      vin: vehicle.vin,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      engine_type: vehicle.engine_type,
      mileage: vehicle.mileage,
    });
    setErrors({});
    setIsEditOpen(true); // 🔑 open edit dialog
  };

  const openAddDialog = () => {
    setEditingVehicle(null);
    setForm({
      vin: "",
      make: "",
      model: "",
      year: "",
      engine_type: "",
      mileage: "",
    });
    setErrors({});
    setIsAddOpen(true);
  };

  // Delete Vehicle
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?"))
      return;
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/vehicles/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(res.data.message);
      toast({
        title: "Vehicle Deleted 🗑️",
        description: "The vehicle was removed successfully",
        variant: "destructive",
      });
      fetchVehicles();
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error deleting vehicle");
      toast({
        title: "Action Failed ❌",
        description: error.response?.data?.message || "Server error",
        variant: "destructive",
      });
    }
  };

  // Fetch Services
  const fetchServices = async (vehicleId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/vehicles/${vehicleId}/services`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setServices((prev) => ({ ...prev, [vehicleId]: res.data }));
    } catch (error) {
      setMessage("Failed to fetch services");
    }
  };

  const handleBookService = (vehicleId: number) => {
    navigate("/customer/bookings", {
      state: { vehicleId },
    });
  };

  return (
    <DashboardLayout role="customer">
      <div className="p-6 space-y-6">
        {/* Message Toast */}
        {message && <div className="text-white p-3 rounded-md">{message}</div>}

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            My <span className="text-primary">Vehicles</span>
          </h1>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={openAddDialog}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Vehicle
              </Button>
            </DialogTrigger>

            {/* white border and black backgroud for form */}
            <DialogContent className="bg-black/100 max-w-xl border border-white">
              <DialogHeader>
                <DialogTitle>Add Vehicle</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-3 mt-2 ">
                {["vin", "make", "model", "engine_type", "year", "mileage"].map(
                  (field) => (
                    <div key={field}>
                      <Label>{field.replace("_", " ").toUpperCase()}</Label>
                      <Input
                        value={form[field]}
                        onChange={(e) =>
                          setForm({ ...form, [field]: e.target.value })
                        }
                      />
                      {errors[field] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[field]}
                        </p>
                      )}
                    </div>
                  )
                )}
                <Button type="submit" className="w-full gradient-primary">
                  Save Vehicle
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="bg-black/100 max-w-xl border border-white">
              <DialogHeader>
                <DialogTitle>Edit Vehicle</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-3 mt-2">
                {["vin", "make", "model", "engine_type", "year", "mileage"].map(
                  (field) => (
                    <div key={field}>
                      <Label>{field.replace("_", " ").toUpperCase()}</Label>
                      <Input
                        value={form[field]}
                        onChange={(e) =>
                          setForm({ ...form, [field]: e.target.value })
                        }
                      />
                      {errors[field] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[field]}
                        </p>
                      )}
                    </div>
                  )
                )}
                <Button type="submit" className="w-full gradient-primary">
                  Update Vehicle
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground mt-1">
          Manage your registered vehicle
        </p>

        {/* Vehicle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <Card
              key={v.id}
              className="bg-card/50 hover:shadow-lg hover:shadow-primary/10 transition-all"
            >
              <div className="h-1 gradient-primary" />
              <CardHeader className="pb-2 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Car className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <CardTitle>
                      {v.year} {v.make} {v.model}
                    </CardTitle>
                    <p className="text-sm text-primary font-mono">{v.vin}</p>
                  </div>
                </div>
                <Badge className="bg-success/20 text-success border-success/30">
                  Active
                </Badge>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span>{v.engine_type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Gauge className="h-4 w-4" /> Mileage
                  </span>
                  <span>{v.mileage} km</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(v)}
                    className="flex-1 flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(v.id)}
                    className="flex-1 flex items-center gap-1"
                  >
                    <Trash className="h-4 w-4" /> Delete
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 flex items-center gap-1"
                    onClick={() =>
                      navigate("/bookings", {
                        state: { vehicleId: v.id },
                      })
                    }
                  >
                    <Wrench className="h-4 w-4" />
                    Book Services
                  </Button>
                </div>

                {/* Vehicle Services */}
                {services[v.id] && services[v.id].length > 0 && (
                  <div className="mt-2 border-t border-border/30 pt-2 space-y-1 text-xs">
                    {services[v.id].map((s) => (
                      <div key={s.job_card_id} className="flex justify-between">
                        <span>{s.service_type}</span>
                        <span>{s.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Vehicles;
