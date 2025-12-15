import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";


const Invoices = () => {
  
  const [invoices, setInvoices] = useState([]);
const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
const token = localStorage.getItem("token");

useEffect(() => {
  if (token) fetchInvoices();
}, [token]);


const fetchInvoices = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/invoices", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    setInvoices(res.data);
  } catch (err) {
    console.error("Invoice fetch failed", err);
  }
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(amount);

  const openInvoice = async (id: number) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/api/invoices/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setSelectedInvoice(res.data);
  } catch (err) {
    console.error("Invoice detail error", err);
  }
};

  const InvoiceDetail = ({ invoice }: { invoice: any }) => (
  <div className="space-y-6">

    {/* HEADER */}
    <div className="flex items-start justify-between pb-4 border-b bg-white/10">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          SVMMS <span className="text-primary">Pro</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          {invoice.service_center_name}
        </p>
        <p className="text-sm text-muted-foreground">
          {invoice.service_center_address}, {invoice.city}
        </p>
      </div>

      <div className="text-right">
        {/* ✅ INVOICE NUMBER */}
        <div className="text-3xl font-bold text-primary">
          {invoice.invoice_number}
        </div>

        {/* ✅ ISSUE DATE */}
        <p className="text-sm text-muted-foreground">
          Date: {formatDate(invoice.issued_at)}
        </p>

        {/* ✅ STATUS */}
        <Badge
          className={
            invoice.status === "paid"
              ? "mt-2 bg-success/20 text-success border-success/30"
              : "mt-2 bg-warning/20 text-warning border-warning/30"
          }
        >
          {invoice.status.toUpperCase()}
        </Badge>
      </div>
    </div>

    {/* CUSTOMER + VEHICLE */}
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold mb-2 text-foreground">Bill To:</h3>
        <p className="text-sm text-foreground">
          {invoice.first_name} {invoice.last_name}
        </p>
        <p className="text-sm text-muted-foreground">{invoice.email}</p>
        <p className="text-sm text-muted-foreground">{invoice.phone}</p>
      </div>

      <div>
        <h3 className="font-semibold mb-2 text-foreground">Vehicle:</h3>
        <p className="text-sm text-foreground">
          {invoice.make} {invoice.model} ({invoice.year})
        </p>
        <p className="text-sm text-muted-foreground">
          VIN: {invoice.vin}
        </p>
        <p className="text-sm text-muted-foreground">
          Service Type: {invoice.service_type}
        </p>
      </div>
    </div>

    {/* AMOUNT TABLE */}
    <div className="border bg-white/10 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-secondary/50">
          <tr>
            <th className="text-left p-4 text-sm font-semibold text-foreground">
              Description
            </th>
            <th className="text-right p-4 text-sm font-semibold text-foreground">
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-t bg-white/10">
            <td className="p-4 text-sm text-foreground">Labor Charges</td>
            <td className="p-4 text-sm text-right text-foreground">
              {formatCurrency(invoice.labor_total)}
            </td>
          </tr>

          <tr className="border-t bg-white/10">
            <td className="p-4 text-sm text-foreground">Parts & Materials</td>
            <td className="p-4 text-sm text-right text-foreground">
              {formatCurrency(invoice.parts_total)}
            </td>
          </tr>

          <tr className="border-t bg-white/10 bg-secondary/30">
            <td className="p-4 text-sm font-semibold text-foreground">
              Subtotal
            </td>
            <td className="p-4 text-sm text-right font-semibold text-foreground">
              {formatCurrency(
                Number(invoice.parts_total) + Number(invoice.labor_total)
              )}
            </td>
          </tr>

          <tr className="border-t bg-white/10">
            <td className="p-4 text-sm text-foreground">Tax</td>
            <td className="p-4 text-sm text-right text-foreground">
              {formatCurrency(invoice.tax)}
            </td>
          </tr>

          <tr className="border-t bg-white/10">
            <td className="p-4 text-sm text-foreground">Discount</td>
            <td className="p-4 text-sm text-right text-foreground">
              {formatCurrency(invoice.discount)}
            </td>
          </tr>

          <tr className="border-t bg-primary/10">
            <td className="p-4 font-bold text-foreground">TOTAL</td>
            <td className="p-4 text-right font-bold text-2xl text-primary">
              {formatCurrency(invoice.total_amount)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    {/* FOOTER */}
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
                        <span className="font-bold text-lg text-primary">
                          {invoice.invoice_number}
                        </span>

                        <Badge
                            className={
                              invoice.status === "paid"
                                ? "bg-success/20 text-success border-success/30"
                                : "bg-warning/20 text-warning border-warning/30"
                            }
                          >
                            {invoice.status.toUpperCase()}
                          </Badge>

                      </div>
                      <div className="text-sm text-muted-foreground">
                          {invoice.make} {invoice.model} ({invoice.year})
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {invoice.service_type} • {formatDate(invoice.issued_at)}
                        </div>

                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Total Amount</div>
                      <div className="text-2xl font-bold text-primary">
                          {formatCurrency(invoice.total_amount)}
                        </div>

                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="bg-white/10"
                            onClick={() => openInvoice(invoice.id)}
                          >
                            View
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-3xl bg-card bg-white/10 max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl">Invoice Details</DialogTitle>
                          </DialogHeader>

                          {selectedInvoice && (
                            <InvoiceDetail invoice={selectedInvoice.invoice} />
                          )}

                          <Button className="w-full gradient-primary text-primary-foreground mt-4">
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                          </Button>
                        </DialogContent>
                      </Dialog>
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
