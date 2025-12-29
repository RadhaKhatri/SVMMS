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
  const [isNewPart, setIsNewPart] = useState(false);

  const [form, setForm] = useState({
    part_id: "",
    name: "",
    unit_price: "",
    category: "",
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
      setIsNewPart(false);
      setForm({
        part_id: String(part.part_id),
        name: "",
        unit_price: "",
        category: "",
        quantity: String(part.quantity ?? ""),
        reorder_level: String(part.reorder_level ?? ""),
        location: part.location ?? "",
      });
    }
  }, [part]);

  /* ---------------- Save Inventory ---------------- */
  const savePart = async () => {
    try {
     if (!form.quantity) {
  alert("Quantity is required");
  return;
}

if (!isNewPart && !form.part_id) {
  alert("Please select an existing part");
  return;
}

if (isNewPart && (!form.name || !form.unit_price)) {
  alert("Part name and unit price are required");
  return;
}
await axios.post(
  "http://localhost:5000/api/manager/inventory",
  {
    ...(isNewPart
      ? {
          name: form.name,
          unit_price: Number(form.unit_price),
          category: form.category || null,
        }
      : {
          part_id: Number(form.part_id),
        }),
    quantity: Number(form.quantity),
    reorder_level: Number(form.reorder_level) || 0,
    location: form.location || null,
  },
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
);


      onRefresh();
      onClose(); 
    } catch (err: any) {
  console.error("Save failed:", err.response?.data);
  alert(err.response?.data?.message || "Failed to save inventory");
}
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-xl w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">
          {part ? "Edit Inventory" : "Add Inventory"}
        </h2>

        {/* -------- Part Type Toggle -------- */}
        {!part && (
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!isNewPart}
                onChange={() => setIsNewPart(false)}
              />
              Existing Part
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={isNewPart}
                onChange={() => setIsNewPart(true)}
              />
              New Part
            </label>
          </div>
        )}

        {/* -------- Existing Part Dropdown -------- */}
        {!isNewPart && (
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
        )}

        {/* -------- New Part Fields -------- */}
        {isNewPart && (
          <>
            <Input
              placeholder="Part Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <Input
              type="number"
              placeholder="Unit Price"
              value={form.unit_price}
              onChange={(e) =>
                setForm({ ...form, unit_price: e.target.value })
              }
            />

            <Input
              placeholder="Category (optional)"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            />
          </>
        )}

        {/* -------- Inventory Fields -------- */}
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

        {/* -------- Actions -------- */}
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
