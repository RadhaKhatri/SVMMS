import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState } from "react";

const PartForm = ({ part, onClose, onSaved }: any) => {
  const [form, setForm] = useState({
    part_code: part?.part_code || "",
    name: part?.name || "",
    description: part?.description || "",
    category: part?.category || "",
    unit_price: part?.unit_price || "",
    service_center_id: "",
    quantity: "",
    reorder_level: "",
    location: "",
  });

  const save = async () => {
    const url = part
      ? `http://localhost:5000/api/admin/inventory/parts/${part.id}`
      : `http://localhost:5000/api/admin/inventory/parts`;

    const method = part ? "put" : "post";

    await axios[method](url, form, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-background p-6 rounded-xl w-full max-w-md space-y-3">
        <h2 className="text-xl font-bold">
          {part ? "Edit Part" : "Add New Part"}
        </h2>

        {!part && (
          <Input
            placeholder="Part Code"
            value={form.part_code}
            onChange={(e) => setForm({ ...form, part_code: e.target.value })}
          />
        )}

        <Input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <Input
          type="number"
          placeholder="Unit Price"
          value={form.unit_price}
          onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
        />

        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </div>
      </div>
    </div>
  );
};

export default PartForm;
