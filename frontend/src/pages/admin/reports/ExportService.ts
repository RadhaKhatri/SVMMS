import api from "@/lib/api";

// Utility to download files from blob
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

/**
 * Export PDF report
 * @param section - e.g., "revenue", "customers", "mechanics"
 * @param filters - dynamic filters: { from, to, city, serviceCenter }
 */
export const exportPDF = async (section: string, filters: any) => {
  try {
    const res = await api.post(
      "/admin/reports/export/pdf",
      { section, filters },
      { responseType: "blob" } // important to get binary data
    );

    downloadFile(res.data, `${section}_report.pdf`);
  } catch (err: any) {
    console.error("PDF export failed:", err.response?.data?.message || err.message);
    throw err;
  }
};

/**
 * Export Excel report
 */
export const exportExcel = async (section: string, filters: any) => {
  try {
    const res = await api.post(
      "/admin/reports/export/excel",
      { section, filters },
      { responseType: "blob" }
    );

    downloadFile(res.data, `${section}_report.xlsx`);
  } catch (err: any) {
    console.error("Excel export failed:", err.response?.data?.message || err.message);
    throw err;
  }
};

/**
 * Send report email
 */
export const sendEmail = async (email: string, section: string, filters: any) => {
  try {
    const res = await api.post("/admin/reports/email", {
      email,
      section,
      filters
    });

    return res.data;
  } catch (err: any) {
    console.error("Email sending failed:", err.response?.data?.message || err.message);
    throw err;
  }
};
