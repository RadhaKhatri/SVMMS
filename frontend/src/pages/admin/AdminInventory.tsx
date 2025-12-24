import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartsCatalog from "./PartsCatalog";
import GlobalInventory from "./GlobalInventory";
import LowStock from "./LowStock";
import UsageLogs from "./UsageLogs";

const AdminInventory = () => {
  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Master parts catalog, stock overview & audit logs
          </p>
        </div>

        <Tabs defaultValue="parts">
          <TabsList>
            <TabsTrigger value="parts">Parts Catalog</TabsTrigger>
            <TabsTrigger value="inventory">Global Inventory</TabsTrigger>
            <TabsTrigger value="low">Low Stock</TabsTrigger>
            <TabsTrigger value="logs">Usage Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="parts">
            <PartsCatalog />
          </TabsContent>

          <TabsContent value="inventory">
            <GlobalInventory />
          </TabsContent>

          <TabsContent value="low">
            <LowStock />
          </TabsContent>

          <TabsContent value="logs">
            <UsageLogs />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminInventory;
