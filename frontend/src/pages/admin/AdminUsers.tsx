import DashboardLayout from "@/components/layouts/DashboardLayout";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  // Filter users based on search input
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search)
  );

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">Customers</h1>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.length === 0 && (
            <p className="text-muted-foreground">No users found</p>
          )}
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              onClick={() => navigate(`/admin/users/${u.id}`)}
              className="p-4 border rounded-lg bg-white/10 hover:border-primary cursor-pointer transition"
            >
              <div className="font-semibold">{u.name}</div>
              <div className="text-sm text-muted-foreground">
                {u.email} • {u.phone}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
