import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Car,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { ReactNode, useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  role?: "customer" | "mechanic" | "manager" | "admin";
}

const DashboardLayout = ({
  children,
  role = "customer",
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = {
    customer: [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/vehicles", icon: Car, label: "My Vehicles" },
      { to: "/bookings", icon: Calendar, label: "Bookings" },
      { to: "/invoices", icon: Receipt, label: "Invoices" },
    ],
    mechanic: [
      { to: "/mechanic/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/mechanic/job-cards", icon: FileText, label: "Job Cards" },
    ],
    manager: [
      { to: "/manager/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/manager/invoice", icon: FileText, label: "Invoice" },
      { to: "/manager/mechanics", icon: Wrench, label: "Mechanics" },
      { to: "/manager/inventory", icon: Package, label: "Inventory" },
    ],
    admin: [
      { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/admin/users", icon: Users, label: "Users" },
      { to: "/admin/service_centers", icon: Wrench, label: "Service Centers" },
      { to: "/admin/inventory", icon: Package, label: "Inventory" },
      { to: "/admin/reports", icon: Receipt, label: "Reports" },
    ],
  };

  const currentNav = navItems[role];

  const roleLabels = {
    customer: "Customer Portal",
    mechanic: "Mechanic Portal",
    manager: "Manager Portal",
    admin: "Admin Portal",
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-sidebar border-r border-sidebar-border text-sidebar-foreground transition-all duration-300 flex flex-col relative`}
      >
        {/* Sidebar Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

        <div className="p-4 flex items-center justify-between border-b border-sidebar-border relative z-10">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sidebar-primary/10 rounded-lg">
                <Wrench className="h-6 w-6 text-sidebar-primary" />
              </div>
              <div>
                <span className="font-bold text-lg block">SVMMS</span>
                <span className="text-xs text-sidebar-primary">
                  {roleLabels[role]}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-sidebar-primary/10 rounded-lg mx-auto">
              <Wrench className="h-6 w-6 text-sidebar-primary" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {currentNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sidebar-accent transition-all duration-200 group"
              activeClassName="bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/30"
            >
              <item.icon className="h-5 w-5 shrink-0 group-hover:scale-110 transition-transform" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          {/** 
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sidebar-accent transition-all duration-200"
            activeClassName="bg-sidebar-primary text-sidebar-primary-foreground"
          >
            <Settings className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span className="font-medium">Settings</span>}
          </NavLink>*/}

          <button
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-all duration-200 w-full text-left"
            onClick={() => (window.location.href = "/")}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  );
};

export default DashboardLayout;
