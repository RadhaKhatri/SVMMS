import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { exportPDF, exportExcel, sendEmail } from "./ExportService";
import { useToast } from "@/hooks/use-toast";

interface ReportActionsProps {
  section: string;
  filters: Record<string, any>;
}

const ReportActions = ({ section, filters }: ReportActionsProps) => {
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState({
    pdf: false,
    excel: false,
    email: false,
  });

  const handlePDF = async () => {
    try {
      setLoading(l => ({ ...l, pdf: true }));
      await exportPDF(section, filters);

      toast({
        title: "Export successful",
        description: `${section.toUpperCase()} PDF downloaded`,
      });
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Unable to generate PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(l => ({ ...l, pdf: false }));
    }
  };

  const handleExcel = async () => {
    try {
      setLoading(l => ({ ...l, excel: true }));
      await exportExcel(section, filters);

      toast({
        title: "Export successful",
        description: `${section.toUpperCase()} Excel downloaded`,
      });
    } catch (err) {
      toast({
        title: "Export failed",
        description: "Unable to generate Excel",
        variant: "destructive",
      });
    } finally {
      setLoading(l => ({ ...l, excel: false }));
    }
  };

  const handleEmail = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(l => ({ ...l, email: true }));
      await sendEmail(email, section, filters);

      toast({
        title: "Email sent",
        description: `Report sent to ${email}`,
      });

      setEmail("");
    } catch (err) {
      toast({
        title: "Email failed",
        description: "Unable to send report email",
        variant: "destructive",
      });
    } finally {
      setLoading(l => ({ ...l, email: false }));
    }
  };

  return (
    <div className="flex flex-wrap gap-9 mb-4 items-center">
    {/*  <Button onClick={handlePDF} disabled={loading.pdf}>
        { ? "Exporting PDF..." : "Export PDF"}
      </Button>*/} 

      <Button onClick={handleExcel} disabled={loading.excel}>
        {loading.excel ? "Exporting Excel..." : "Export Excel"}
      </Button>

      <Input
        placeholder="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-64"
      />

      <Button onClick={handleEmail} disabled={loading.email}>
        {loading.email ? "Sending..." : "Send Email"}
      </Button>
    </div>
  );
};

export default ReportActions;
