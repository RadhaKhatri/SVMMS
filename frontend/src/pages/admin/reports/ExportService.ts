import api from "@/lib/api";

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export const exportPDF = async (section: string, filters: any) => {
  const res = await api.post(
    "/admin/reports/export/pdf",
    { section, filters },
    { responseType: "blob" }
  );

  downloadFile(res.data, `${section}_report.pdf`);
};

export const exportExcel = async (section: string, filters: any) => {
  const res = await api.post(
    "/admin/reports/export/excel",
    { section, filters },
    { responseType: "blob" }
  );

  downloadFile(res.data, `${section}_report.xlsx`);
};

export const sendEmail = async (email: string, section: string, filters: any) => {
  const res = await api.post("/admin/reports/email", {
    email,
    section,
    filters
  });

  return res.data;
};
