// src/components/manager/ServiceCenterModal.tsx
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useState } from "react";

type Props = {
  open: boolean;
  onSuccess: () => void;
  onClose: () => void;
};

const ServiceCenterModal = ({ open, onClose, onSuccess }: Props) => {
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    contact_number: "",
  });

  const submit = async () => {
    await axios.post("http://localhost:5000/api/manager/service-center", form, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register Service Center</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Service Center Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          placeholder="Address"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <Input
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />

        <Input
          placeholder="Contact Number"
          value={form.contact_number}
          onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
        />

        <Button className="w-full mt-4" onClick={submit}>
          Create Service Center
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceCenterModal;
