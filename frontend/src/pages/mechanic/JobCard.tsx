import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  Car,
  Clock,
  Gauge,
  Mail,
  Phone,
  Trash2,
  User,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const JobCard = () => {
  const { id } = useParams();
  const [jobCard, setJobCard] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [notes, setNotes] = useState("");
  const [availableParts, setAvailableParts] = useState<any[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [partQty, setPartQty] = useState(1);
  const { toast } = useToast();

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const fetchJobCard = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/mechanic/job-cards/${id}`,
      { headers }
    );

    setJobCard(res.data);
    setTasks(res.data.tasks || []); // ✅ IMPORTANT
    setParts(res.data.parts || []);
    setNotes(res.data.notes || "");
  };

  const fetchAvailableParts = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/mechanic/job-cards/${id}/available-parts`,
      { headers }
    );

    setAvailableParts(res.data);
  };

  const updateStatus = async (jobCardId: number, status: string) => {
    await axios.patch(
      `http://localhost:5000/api/mechanic/job-cards/${jobCardId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  };

  const addTask = async () => {
    await axios.post(
      `http://localhost:5000/api/mechanic/job-cards/${id}/tasks`,
      {
        description: "Brake inspection",
        hours: 2,
        labor_rate: 500,
      },
      { headers }
    );

    fetchJobCard();
  };

  const addPart = async () => {
    if (!selectedPartId) {
      toast({
        title: "Select a part",
        description: "Please choose a spare part",
        variant: "destructive",
      });
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/mechanic/job-cards/${id}/parts`,
        {
          part_id: selectedPartId,
          quantity_used: partQty,
        },
        { headers }
      );

      toast({
        title: "Part added",
        description: "Inventory updated successfully",
      });

      setSelectedPartId(null);
      setPartQty(1);

      fetchJobCard();
      fetchAvailableParts();
    } catch (err: any) {
      toast({
        title: "Cannot add part",
        description: err.response?.data?.message || "Inventory not available",
        variant: "destructive",
      });
    }
  };

  const saveNotes = async () => {
    try {
      await axios.patch(
        `http://localhost:5000/api/mechanic/job-cards/${id}/notes`,
        { notes },
        { headers }
      );

      toast({
        title: "Notes saved",
        description: "Work notes updated successfully",
      });

      fetchJobCard(); // 👈 refresh card so notes reflect
    } catch {
      toast({
        title: "Failed to save notes",
        variant: "destructive",
      });
    }
  };

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case "open":
        return {
          className: "bg-warning/20 text-warning border-warning/30",
          label: "OPEN",
        };
      case "in_progress":
        return {
          className: "bg-primary/20 text-primary border-primary/30",
          label: "IN PROGRESS",
        };
      case "completed":
        return {
          className: "bg-success/20 text-success border-success/30",
          label: "COMPLETED",
        };
      default:
        return {
          className: "bg-secondary",
          label: status || "UNKNOWN",
        };
    }
  };

  const toggleTaskComplete = async (taskId: number) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/mechanic/job-cards/${id}/tasks/${taskId}/complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Refresh job card so UI updates
      fetchJobCard();

      toast({
        title: "Task updated",
        description: "Task marked as completed",
      });
    } catch (err) {
      console.error("Task update failed", err);

      toast({
        title: "Failed to update task",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const totalPartsCost = parts.reduce((sum, p) => {
    const price = Number(p.unit_price ?? 0);
    const qty = Number(p.quantity_used ?? 0);
    return sum + price * qty;
  }, 0);

  useEffect(() => {
    fetchJobCard();
    fetchAvailableParts();
  }, [id]);

  // ⬇️ AFTER useState, useEffect, helper functions
  if (!jobCard) {
    return (
      <DashboardLayout role="mechanic">
        <div className="p-6">Loading job card...</div>
      </DashboardLayout>
    );
  }

  const statusConfig = getStatusConfig(jobCard?.status);

  return (
    <DashboardLayout role="mechanic">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-primary">
                Job card {jobCard.id}
              </h1>
              <Badge className={statusConfig.className}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">
              {jobCard.service_type}
            </p>
          </div>
          <div className="flex gap-3">
            {jobCard.status === "open" && (
              <Button
                onClick={async () => {
                  await updateStatus(jobCard.id, "in_progress");
                  toast({
                    title: "Job Started",
                    description: "Work is now in progress",
                  });
                  fetchJobCard();
                }}
              >
                Start Job
              </Button>
            )}

            {jobCard.status === "in_progress" && (
              <Button
                onClick={async () => {
                  await updateStatus(jobCard.id, "completed");
                  toast({
                    title: "Job Completed",
                    description: "Sent to manager for invoice",
                  });
                  fetchJobCard();
                }}
                disabled={!tasks.every((t) => t.completed)}
              >
                Complete Job
              </Button>
            )}
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
              <div className="font-semibold text-lg text-foreground">
                {jobCard.customer.name}
              </div>
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
                Year: {jobCard.vehicle.year} <br /> Make: {jobCard.vehicle.make}
              </div>
              <div className="text-sm text-muted-foreground">
                Model:{" "}
                <span className="font-mono text-primary">
                  {jobCard.vehicle.model}
                </span>
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
                <span className="font-medium text-foreground">
                  {jobCard.timeline.start_time
                    ? new Date(jobCard.timeline.start_time).toLocaleString()
                    : "Not started"}
                </span>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Est. Completion:{" "}
                </span>
                <span className="font-medium text-primary">
                  {jobCard.timeline.preferred_date}
                </span>
              </div>
              <div className="pt-2">
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="h-2 rounded-full gradient-primary"
                    style={{ width: "50%" }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tasks">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger
              value="tasks"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Tasks
            </TabsTrigger>
            <TabsTrigger
              value="parts"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Parts Used
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Notes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4 mt-6">
            <Card className="bg-card/50 bg-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Task Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      task.completed
                        ? "bg-success/5 border-success/20"
                        : "bg-secondary/30 bg-white/10 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskComplete(task.id)}
                      />
                      <span
                        className={
                          task.completed
                            ? "line-through text-muted-foreground"
                            : "font-medium"
                        }
                      >
                        {task.description}
                      </span>
                    </div>

                    <Badge variant="outline">
                      {task.hours}h × ₹{task.labor_rate}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="parts" className="space-y-4 mt-6">
            <Card className="bg-card/50 bg-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Parts & Materials</CardTitle>
                <select
                  value={selectedPartId ?? ""}
                  onChange={(e) => setSelectedPartId(Number(e.target.value))}
                  className="input text-black"
                >
                  <option value="">Select Extra Part</option>
                  {availableParts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.quantity})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  value={partQty}
                  onChange={(e) => setPartQty(Number(e.target.value))}
                  className="input text-black"
                />

                <Button onClick={addPart}>Add Extra Part</Button>
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
                          <div className="font-semibold text-foreground">
                            {part.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Qty: {part.quantity} | Stock:{" "}
                            <span className="text-primary">
                              {part.quantity_used}
                            </span>{" "}
                            available
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-lg text-primary">
                          ₹{Number(part.unit_price).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {/*  <div className="mt-6 pt-4 border-t bg-white/10 flex justify-between items-center">
                  <span className="font-semibold text-foreground">Total Parts Cost:</span>
                  <span className="text-2xl font-bold text-primary">
  ₹{totalPartsCost.toFixed(2)}
</span>

                </div>*/}
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
                  <Label htmlFor="notes" className="text-foreground">
                    Add Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Document any findings, issues, or additional work needed..."
                    rows={4}
                    className="bg-secondary/50 bg-white/10 focus:border-primary"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  <Button
                    onClick={saveNotes}
                    className="gradient-primary text-primary-foreground"
                  >
                    Save Note
                  </Button>

                  <p className="mt-2 whitespace-pre-wrap text-foreground">
                    {jobCard.notes}
                  </p>
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
