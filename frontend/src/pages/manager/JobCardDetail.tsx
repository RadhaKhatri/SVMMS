import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const JobCardDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [taskDesc, setTaskDesc] = useState<string>("");

  const [taskHours, setTaskHours] = useState("");
  const [taskRate, setTaskRate] = useState("");

  const [parts, setParts] = useState<any[]>([]);
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [partQty, setPartQty] = useState("");
  const [tax, setTax] = useState("");
  const [discount, setDiscount] = useState("");

  const fetchJobCard = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/manager/job-cards/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setJob(res.data);
    } catch (err) {
      console.error("Failed to load job card", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParts = async () => {
    const res = await axios.get("http://localhost:5000/api/manager/parts", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    setParts(res.data);
  };

  useEffect(() => {
    if (id) {
      fetchJobCard();
      fetchParts();
    }
  }, [id]);

  const addTask = async () => {
    if (!taskDesc || !taskHours || !taskRate) {
      toast({
        title: "Missing fields",
        description: "Please fill all task details",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/manager/job-cards/${id}/tasks`,
        {
          description: taskDesc,
          hours: Number(taskHours),
          labor_rate: Number(taskRate),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast({
        title: "Task Added",
        description: res.data.message,
      });
      // reset
      setTaskDesc("");
      setTaskHours("");
      setTaskRate("");

      fetchJobCard();
    } catch (err) {
      toast({
        title: "Add task failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const addPart = async () => {
    if (!selectedPart || !partQty) {
      toast({
        title: "Missing fields",
        description: "Select part and quantity",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/manager/job-cards/${id}/parts`,
        {
          part_id: selectedPart,
          quantity: Number(partQty),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast({
        title: "Part Added",
        description: res.data.message,
      });

      setSelectedPart(null);
      setPartQty("");

      fetchJobCard();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Inventory not available";

      toast({
        title: "Add part failed",
        description: msg,
        variant: "destructive",
      });
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/manager/job-cards/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      fetchJobCard();
    } catch (err) {
      console.error("Status update failed", err);
      alert("Failed to update status");
    }
  };

  const generateInvoice = async () => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/manager/job-cards/${id}/invoice`,
        {
          tax_percent: Number(tax || 0),
          discount_percent: Number(discount || 0),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast({
        title: "Invoice Generated",
        description: `Invoice No: ${res.data.invoice_number}`,
      });

      setTax("");
      setDiscount("");
      fetchJobCard();
    } catch (err) {
      toast({
        title: "Invoice failed",
        description: "Unable to generate invoice",
        variant: "destructive",
      });
    }
  };

  // ================= INVOICE CALCULATIONS =================
  const subtotal = (job?.costs?.labor || 0) + (job?.costs?.parts || 0);

  const taxAmount = (subtotal * Number(tax || 0)) / 100;

  const discountAmount = (subtotal * Number(discount || 0)) / 100;

  const finalTotal = subtotal + taxAmount - discountAmount;

  if (loading) return <div className="p-6">Loading...</div>;
  if (!job) return <div className="p-6">Job card not found</div>;

  return (
    <DashboardLayout role="manager">
      <div className="p-6 space-y-6">
        {/* HEADER */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Job Card #{job.id}</CardTitle>
            <Badge>{job.status?.toUpperCase()}</Badge>
          </CardHeader>
        </Card>

        {/* CUSTOMER */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <b>Name:</b> {job.customer?.name}
            </div>
            <div>
              <b>Phone:</b> {job.customer?.phone}
            </div>
            <div>
              <b>Email:</b> {job.customer?.email}
            </div>
          </CardContent>
        </Card>

        {/* VEHICLE */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <b>Vehicle:</b> {job.vehicle?.make} {job.vehicle?.model} (
              {job.vehicle?.year})
            </div>
            <div>
              <b>Engine:</b> {job.vehicle?.engine_type || "—"}
            </div>

            <div>
              <b>VIN:</b> {job.vehicle?.vin || "—"}
            </div>
            <div>
              <b>Mileage:</b> {job.vehicle?.mileage || "—"}
            </div>
          </CardContent>
        </Card>

        {/* SERVICE */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>
              <b>Service Type:</b>{" "}
              {job.services?.length ? job.services.join(", ") : "Not specified"}
            </div>
            <div>
              <b>Mechanic:</b> {job.mechanic?.name || "Not Assigned"}
            </div>
            <div>
              <b>Preferred Date:</b> {job.timeline?.preferred_date}
            </div>
            <div>
              <b>Preferred Time:</b> {job.timeline?.preferred_time}
            </div>
          </CardContent>
        </Card>

        {/* COST */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Summary</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div>Labor: ₹{job.costs?.labor}</div>
            <div>Parts: ₹{job.costs?.parts}</div>
            <div className="font-bold border-t pt-2">
              Total: ₹{(job.costs?.labor || 0) + (job.costs?.parts || 0)}
            </div>
          </CardContent>
        </Card>
        {/* ================= Add Labor Task ================= */}
        <Card className="text-white dark:text-gray-100">
          <CardHeader>
            <CardTitle>Add Labor Task</CardTitle>
          </CardHeader>
          <div className="grid  gap-6">
            <CardContent className=" text-black space-y-2 space-x-9 ">
              <input
                type="text"
                placeholder="Task description"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="input "
              />
              <input
                type="number"
                placeholder="Hours"
                value={taskHours}
                onChange={(e) => setTaskHours(e.target.value)}
                className="input"
                min="0"
                step="0.1"
              />
              <input
                type="number"
                placeholder="Rate"
                value={taskRate}
                onChange={(e) => setTaskRate(e.target.value)}
                className="input"
                min="0"
                step="1"
              />
              <Button onClick={addTask}>Add Task</Button>
            </CardContent>
          </div>
        </Card>

        {/* ================= Add Spare Parts ================= */}
        <Card className="text-white dark:text-gray-100 ">
          <CardHeader>
            <CardTitle>Add Spare Part</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2 space-x-9 text-black">
            <select
              value={selectedPart ?? ""}
              onChange={(e) =>
                setSelectedPart(e.target.value ? Number(e.target.value) : null)
              }
              className="input"
            >
              <option value="">Select Part</option>
              {parts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Quantity"
              value={partQty}
              onChange={(e) => setPartQty(e.target.value)}
              className="input"
              min="1"
            />

            <Button onClick={addPart}>Add Part</Button>
          </CardContent>
        </Card>

        {/* ================= TAX & DISCOUNT ================= */}
        <Card className="text-white dark:text-gray-100">
          <CardHeader>
            <CardTitle>Invoice Adjustments</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 space-x-9 text-black">
            <input
              type="number"
              placeholder="Tax (%)"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              min="0"
            />

            <input
              type="number"
              placeholder="Discount (%)"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              min="0"
            />

            <div className="text-sm text-muted-foreground">
              Subtotal: ₹{subtotal.toFixed(2)} <br />
              Tax ({tax || 0}%): ₹{taxAmount.toFixed(2)} <br />
              Discount ({discount || 0}%): ₹{discountAmount.toFixed(2)} <br />
              <strong>Final Total: ₹{finalTotal.toFixed(2)}</strong>
            </div>
          </CardContent>
        </Card>

        {/* ================= Update Status / Generate Invoice ================= */}
        <Card className="text-white dark:text-gray-100">
          <CardHeader>
            <CardTitle>Update Job Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 space-x-9 text-black">
            <select
              value={job.status}
              onChange={(e) => updateStatus(e.target.value)}
              className="input"
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            {job.status === "completed" && (
              <Button onClick={generateInvoice}>Generate Invoice</Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default JobCardDetail;
