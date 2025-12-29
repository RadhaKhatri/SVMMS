import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import OverviewReport from "./OverviewReport";
import RevenueReport from "./RevenueReport";
import JobReport from "./JobReport";
import ServiceCenterReport from "./ServiceCenterReport";
import MechanicReport from "./MechanicReport";
import CustomerReport from "./CustomerReport";
import PartsInventoryReport from "./PartsInventoryReport";
import BookingReport from "./BookingReport";
import LocationReport from "./LocationReport";
import TimeReport from "./TimeReport";

const AdminReports = () => {
  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-6 ">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Business insights across revenue, jobs, inventory & performance
          </p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="flex flex-wrap gap-2 bg-white/100">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="jobs">Job Cards</TabsTrigger>
            <TabsTrigger value="centers">Service Centers</TabsTrigger>
            <TabsTrigger value="mechanics">Mechanics</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="parts">Parts</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="time">Time</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewReport /></TabsContent>
          <TabsContent value="revenue"><RevenueReport /></TabsContent>
          <TabsContent value="jobs"><JobReport /></TabsContent>
          <TabsContent value="centers"><ServiceCenterReport /></TabsContent>
          <TabsContent value="mechanics"><MechanicReport /></TabsContent>
          <TabsContent value="customers"><CustomerReport /></TabsContent>
          <TabsContent value="parts"><PartsInventoryReport /></TabsContent>
          <TabsContent value="bookings"><BookingReport /></TabsContent>
          <TabsContent value="location"><LocationReport /></TabsContent>
          <TabsContent value="time"><TimeReport /></TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
