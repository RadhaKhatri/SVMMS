import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const MechanicProfile = () => {
  const { toast } = useToast();
  const token = localStorage.getItem("token");

  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState<any>({});
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/mechanic/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProfile(res.data);
        setForm(res.data);
      })
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        })
      );
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        "http://localhost:5000/api/mechanic/profile",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(form);
      setIsEditing(false);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated",
      });
    } catch {
      toast({
        title: "Update Failed",
        description: "Unable to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout role="mechanic">
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>My Profile</CardTitle>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {!isEditing ? (
              <>
                <p><b>Name:</b> {profile.name}</p>
                <p><b>Email:</b> {profile.email}</p>
                <p><b>Phone:</b> {profile.phone || "-"}</p>
                <p><b>Address:</b> {profile.address || "-"}</p>
                <p><b>Hourly Rate:</b> ₹{profile.hourly_rate || 0}</p>
                <p><b>Certifications:</b> {profile.certifications || "-"}</p>
                <p><b>Status:</b> {profile.availability_status || "available"}</p>
                <p><b>Notes:</b> {profile.notes || "-"}</p>
              </>
            ) : (
              <>
                <div>
                  <Label>Phone</Label>
                  <Input name="phone" value={form.phone || ""} onChange={handleChange} />
                </div>

                <div>
                  <Label>Address</Label>
                  <Textarea name="address" value={form.address || ""} onChange={handleChange} />
                </div>

                <div>
                  <Label>Hourly Rate</Label>
                  <Input
                    type="number"
                    name="hourly_rate"
                    value={form.hourly_rate || ""}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label>Certifications</Label>
                  <Textarea
                    name="certifications"
                    value={form.certifications || ""}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea name="notes" value={form.notes || ""} onChange={handleChange} />
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MechanicProfile;
