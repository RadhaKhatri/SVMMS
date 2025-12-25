import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { exportPDF, exportExcel, sendEmail } from "./ExportService";

const ReportActions = ({ section, filters }: any) => {
  const [email, setEmail] = useState("");
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        onClick={async () => {
          try {
            await exportPDF(section, filters);
            alert("PDF downloaded");
          } catch (e) {
            alert("PDF export failed");
          }
        }}
      >
        Export PDF
      </Button>

      <Button
  onClick={async () => {
    try {
      await exportExcel(section, filters);
      alert("Excel downloaded");
    } catch (e) {
      alert("Excel export failed");
    }
  }}
>
  Export Excel
</Button>


      <Input
        placeholder="Email address"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-64"
      />
      <Button
  onClick={async () => {
    try {
      await sendEmail(email, section, filters);
      alert("Email sent");
    } catch (e) {
      alert("Email failed");
    }
  }}
>
  Send Email
</Button>

    </div>
  );
};

export default ReportActions;
