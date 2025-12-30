import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AdminInventory from "@/pages/admin/AdminInventory";
import AdminServiceCenterDetails from "@/pages/admin/AdminServiceCenterDetails";
import AdminServiceCenters from "@/pages/admin/AdminServiceCenters";
import AdminUserDetails from "@/pages/admin/AdminUserDetails";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminReports from "@/pages/admin/reports/AdminReports";
import JobCardDetail from "@/pages/manager/JobCardDetail";
import JobCards from "@/pages/manager/JobCards";
import ManagerInvoice from "@/pages/manager/ManagerInvoice";
import MechanicsRequest from "@/pages/manager/MechanicRequests";
import ManagerProfile from "@/pages/manager/Profile";
import MechanicProfile from "@/pages/mechanic/MechanicProfile";
import ServiceCenterRequests from "@/pages/mechanic/ServiceCenterRequests";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Bookings from "./pages/customer/Bookings";
import Dashboard from "./pages/customer/Dashboard";
import Vehicles from "./pages/customer/Vehicles";
import ForgotPassword from "./pages/ForgotPassword";
import Invoices from "./pages/Invoices";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Inventory from "./pages/manager/Inventory";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import JobCard from "./pages/mechanic/JobCard";
import MechanicDashboard from "./pages/mechanic/MechanicDashboard";
import MechanicJobCards from "./pages/mechanic/MechanicJobCards";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Customer Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/invoices" element={<Invoices />} />

          {/* Mechanic Routes */}
          <Route path="/mechanic/dashboard" element={<MechanicDashboard />} />
          <Route path="/mechanic/job-cards/:id" element={<JobCard />} />

          {/* Manager Routes */}
          <Route path="/manager/dashboard" element={<ManagerDashboard />} />
          <Route path="/manager/inventory" element={<Inventory />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/manager/profile" element={<ManagerProfile />} />
          <Route path="/manager/job-cards" element={<JobCards />} />
          <Route path="/manager/job-cards/:id" element={<JobCardDetail />} />
          <Route path="/mechanic/profile" element={<MechanicProfile />} />
          <Route
            path="/mechanic/service-center-requests"
            element={<ServiceCenterRequests />}
          />
          <Route path="/manager/mechanics" element={<MechanicsRequest />} />
          <Route path="/mechanic/job-cards" element={<MechanicJobCards />} />
          <Route path="/manager/invoice" element={<ManagerInvoice />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:id" element={<AdminUserDetails />} />
          <Route
            path="/admin/service_centers"
            element={<AdminServiceCenters />}
          />
          <Route
            path="/admin/service_centers/:id"
            element={<AdminServiceCenterDetails />}
          />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/reports" element={<AdminReports />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
