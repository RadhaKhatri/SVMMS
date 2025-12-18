import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const ManagerProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================
     FETCH PROFILE
  ========================= */
  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/manager/profile",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      let manager = res.data.manager;

      // Fallback: split name if first/last missing
      if ((!manager.first_name || !manager.last_name) && manager.name) {
        const parts = manager.name.trim().split(" ");
        manager.first_name = parts[0];
        manager.last_name = parts.slice(1).join(" ") || "";
      }

      setProfile({ ...res.data, manager });

      setForm({
        first_name: manager.first_name || "",
        last_name: manager.last_name || "",
        phone: manager.phone || "",
        address: manager.address || "",
        center_name: res.data.service_center?.name || "",
        city: res.data.service_center?.city || "",
        contact_number: res.data.service_center?.contact_number || "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* =========================
     SAVE PROFILE
  ========================= */
  const handleSave = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/manager/profile",
        form,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast({
        title: "Profile Updated",
        description: "Your profile details have been saved successfully",
      });

      setEditMode(false);
      fetchProfile();
    } catch (err) {
      toast({
        title: "Update Failed",
        description: "Unable to update profile",
        variant: "destructive",
      });
    }
  };

  /* =========================
     LOADING / ERROR
  ========================= */
  if (loading) {
    return (
      <DashboardLayout role="manager">
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="manager">
        <div className="p-6 text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <DashboardLayout role="manager">
      <div className="p-6 space-y-6">

        {/* MANAGER PROFILE */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Manager Profile</CardTitle>
            <Button
              variant="outline"
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Cancel" : "Edit"}
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {editMode ? (
              <>
                <Input
                  placeholder="First Name"
                  value={form.first_name}
                  onChange={(e) =>
                    setForm({ ...form, first_name: e.target.value })
                  }
                />
                <Input
                  placeholder="Last Name"
                  value={form.last_name}
                  onChange={(e) =>
                    setForm({ ...form, last_name: e.target.value })
                  }
                />
                <Input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
                <Input
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </>
            ) : (
              <>
                <div>
                  Name: {profile.manager.first_name}{" "}
                  {profile.manager.last_name}
                </div>
                <div>Email: {profile.manager.email}</div>
                <div>Phone: {profile.manager.phone}</div>
                <div>Address: {profile.manager.address}</div>
              </>
            )}
          </CardContent>
        </Card>

        {/* SERVICE CENTER */}
        <Card>
          <CardHeader>
            <CardTitle>Service Center</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {profile.service_center ? (
              editMode ? (
                <>
                  <Input
                    placeholder="Service Center Name"
                    value={form.center_name}
                    onChange={(e) =>
                      setForm({ ...form, center_name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="City"
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Contact Number"
                    value={form.contact_number}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        contact_number: e.target.value,
                      })
                    }
                  />

                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <div>Name: {profile.service_center.name}</div>
                  <div>City: {profile.service_center.city}</div>
                  <div>
                    Contact: {profile.service_center.contact_number}
                  </div>
                </>
              )
            ) : (
              <div className="text-muted-foreground">
                Service center not registered
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default ManagerProfile;
