import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import PartForm from "./PartForm";

const PartsCatalog = () => {
  const [parts, setParts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editPart, setEditPart] = useState<any>(null);

  const loadParts = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/admin/inventory/parts",
      { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
    );
    setParts(res.data);
  };

  useEffect(() => {
    loadParts();
  }, []);

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditPart(null); setOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Part
        </Button>
      </div>

      <div className="grid gap-4">
        {parts.map(p => (
          <Card key={p.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between">
                {p.name}
                <Button size="sm" variant="outline"
                  onClick={() => { setEditPart(p); setOpen(true); }}>
                  Edit
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div>Code: {p.part_code}</div>
              <div>Category: {p.category}</div>
              <div className="font-semibold text-primary">
                ₹{p.unit_price}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {open && (
        <PartForm
          part={editPart}
          onClose={() => setOpen(false)}
          onSaved={loadParts}
        />
      )}
    </>
  );
};

export default PartsCatalog;
