import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, FileText } from "lucide-react";

const Invoices = () => {
  const invoices = [
    { id: "INV-001", date: "2024-01-15", vehicle: "2020 Toyota Camry - ABC1234", service: "Brake Repair", labor: 120.0, parts: 102.98, tax: 22.30, total: 245.28, status: "paid" },
    { id: "INV-002", date: "2024-01-10", vehicle: "2019 Honda Civic - XYZ5678", service: "Oil Change", labor: 45.0, parts: 32.99, tax: 7.80, total: 85.79, status: "paid" },
  ];

  const InvoiceDetail = ({ invoice }: { invoice: typeof invoices[0] }) => (
    <div className="space-y-6">
      <div className="flex items-start justify-between pb-4 border-b bg-white/10">
        <div>
          <h2 className="text-2xl font-bold text-foreground">SVMMS <span className="text-primary">Pro</span></h2>
          <p className="text-sm text-muted-foreground">123 Service Street</p>
          <p className="text-sm text-muted-foreground">Automotive City, AC 12345</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{invoice.id}</div>
          <p className="text-sm text-muted-foreground">Date: {invoice.date}</p>
          <Badge className="mt-2 bg-success/20 text-success border-success/30">{invoice.status.toUpperCase()}</Badge>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2 text-foreground">Bill To:</h3>
          <p className="text-sm text-foreground">John Doe</p>
          <p className="text-sm text-muted-foreground">john.doe@example.com</p>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-foreground">Vehicle:</h3>
          <p className="text-sm text-foreground">{invoice.vehicle}</p>
          <p className="text-sm text-muted-foreground">Service: {invoice.service}</p>
        </div>
      </div>
      <div className="border bg-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/50">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-foreground">Description</th>
              <th className="text-right p-4 text-sm font-semibold text-foreground">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t bg-white/10"><td className="p-4 text-sm text-foreground">Labor Charges</td><td className="p-4 text-sm text-right text-foreground">${invoice.labor.toFixed(2)}</td></tr>
            <tr className="border-t bg-white/10"><td className="p-4 text-sm text-foreground">Parts & Materials</td><td className="p-4 text-sm text-right text-foreground">${invoice.parts.toFixed(2)}</td></tr>
            <tr className="border-t bg-white/10 bg-secondary/30"><td className="p-4 text-sm font-semibold text-foreground">Subtotal</td><td className="p-4 text-sm text-right font-semibold text-foreground">${(invoice.labor + invoice.parts).toFixed(2)}</td></tr>
            <tr className="border-t bg-white/10"><td className="p-4 text-sm text-foreground">Tax (10%)</td><td className="p-4 text-sm text-right text-foreground">${invoice.tax.toFixed(2)}</td></tr>
            <tr className="border-t bg-white/10 bg-primary/10"><td className="p-4 font-bold text-foreground">TOTAL</td><td className="p-4 text-right font-bold text-2xl text-primary">${invoice.total.toFixed(2)}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="pt-4 border-t bg-white/10 text-center text-sm text-muted-foreground">
        <p>Thank you for choosing SVMMS!</p>
      </div>
    </div>
  );

  return (
    <DashboardLayout role="customer">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My <span className="text-primary">Invoices</span></h1>
          <p className="text-muted-foreground mt-1">View and download your service invoices</p>
        </div>
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="bg-card/50 bg-white/10 hover:border-primary/30 transition-all overflow-hidden">
              <div className="h-1 gradient-primary" />
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl"><FileText className="h-6 w-6 text-primary" /></div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-lg text-primary">{invoice.id}</span>
                        <Badge className="bg-success/20 text-success border-success/30">{invoice.status}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{invoice.vehicle}</div>
                      <div className="text-sm text-muted-foreground">{invoice.service} • {invoice.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                      <div className="text-2xl font-bold text-primary">${invoice.total.toFixed(2)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild><Button variant="outline" className="bg-white/10">View</Button></DialogTrigger>
                        <DialogContent className="max-w-3xl bg-card bg-white/10 max-h-[80vh] overflow-y-auto">
                          <DialogHeader><DialogTitle className="text-xl">Invoice Details</DialogTitle></DialogHeader>
                          <InvoiceDetail invoice={invoice} />
                          <Button className="w-full gradient-primary text-primary-foreground mt-4"><Download className="mr-2 h-4 w-4" />Download PDF</Button>
                        </DialogContent>
                      </Dialog>
                      <Button className="gradient-primary text-primary-foreground"><Download className="mr-2 h-4 w-4" />PDF</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
