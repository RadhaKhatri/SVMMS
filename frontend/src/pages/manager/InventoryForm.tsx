import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";

interface Part {
  id: number;
  name: string;
  part_code: string;
}

const InventoryForm = ({ part, onClose, onRefresh }: any) => {
  const [parts, setParts] = useState<Part[]>([]);

  const [form, setForm] = useState({
    part_id: "",
    quantity: "",
    reorder_level: "",
    location: "",
  });

  /* ---------------- Load Parts Dropdown ---------------- */
  useEffect(() => {
    const loadParts = async () => {
      const res = await axios.get(
        "http://localhost:5000/api/manager/parts",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setParts(res.data);
    };
    loadParts();
  }, []);

  /* ---------------- Edit Mode ---------------- */
 useEffect(() => {
  if (part) {
    setForm({
      part_id: String(part.part_id), // ✅ now REAL part_id
      quantity: String(part.quantity ?? ""),
      reorder_level: String(part.reorder_level ?? ""),
      location: part.location ?? "",
    });
  }
}, [part]);


  /* ---------------- Save Inventory ---------------- */
  const savePart = async () => {
    try {
      
      if (!form.part_id || !form.quantity) {
        alert("Part and Quantity are required");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/manager/inventory",
        {
          part_id: Number(form.part_id),
          quantity: Number(form.quantity),
          reorder_level: Number(form.reorder_level) || 0,
          location: form.location,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      onRefresh();
      onClose();
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save inventory");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-xl w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">
          {part ? "Edit Inventory" : "Add Inventory"}
        </h2>

        {/* ----------- PART DROPDOWN ----------- */}
        <select
          className="w-full border rounded-md px-3 py-2 bg-background"
          value={form.part_id}
          onChange={(e) =>
            setForm({ ...form, part_id: e.target.value })
          }
          disabled={!!part}
        >
          <option value="">Select Part</option>
          {parts.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.part_code})
            </option>
          ))}
        </select>

        <Input
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: e.target.value })
          }
        />

        <Input
          type="number"
          placeholder="Reorder Level"
          value={form.reorder_level}
          onChange={(e) =>
            setForm({ ...form, reorder_level: e.target.value })
          }
        />

        <Input
          placeholder="Location (Rack / Shelf / Bin)"
          value={form.location}
          onChange={(e) =>
            setForm({ ...form, location: e.target.value })
          }
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={savePart}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default InventoryForm;
