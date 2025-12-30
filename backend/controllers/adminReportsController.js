import ExcelJS from "exceljs";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import pool from "../db.js";

/* =========================
   1️⃣ OVERVIEW / SUMMARY
========================= */
export const getReportsSummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM service_bookings) AS total_bookings,
        (SELECT COUNT(*) FROM job_cards WHERE status = 'completed') AS completed_jobs,
        (SELECT COALESCE(SUM(total_amount),0) FROM invoices WHERE status = 'paid') AS total_revenue,
        (SELECT COUNT(*) FROM service_centers) AS service_centers,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') AS customers,
        (SELECT COALESCE(SUM(quantity_used),0) FROM job_parts) AS total_parts_used
    `);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   2️⃣ REVENUE REPORTS
========================= */

export const getDetailedRevenueReport = async (req, res) => {
  const { from, to, city, serviceCenterId } = req.query;

  try {
    const params = [from, to];
    let filterSql = "";

    if (city) {
      params.push(city);
      filterSql += ` AND sc.city = $${params.length}`;
    }

    if (serviceCenterId) {
      params.push(serviceCenterId);
      filterSql += ` AND sc.id = $${params.length}`;
    }

    const result = await pool.query(
      `
      SELECT
        i.invoice_number,
        DATE(i.issued_at) AS invoice_date,
        u.name AS customer_name,
        u.email AS customer_email,
        sc.name AS service_center_name,
        sc.city,
        jc.id AS job_card_id,
        jc.status AS job_status,
        i.labor_total,
        i.parts_total,
        i.tax,
        i.discount,
        i.total_amount
      FROM invoices i
      JOIN job_cards jc ON jc.id = i.job_card_id
      JOIN users u ON u.id = jc.customer_id
      JOIN service_centers sc ON sc.id = jc.service_center_id
      WHERE i.status = 'paid'
        AND i.issued_at BETWEEN $1 AND $2
        ${filterSql}
      ORDER BY i.issued_at DESC
    `,
      params
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Revenue report error:", err);
    res.status(500).json({ message: "Failed to load revenue report" });
  }
};

/**
 * GET /api/admin/reports/jobs/detailed
 */
export const getDetailedJobReport = async (req, res) => {
  try {
    const { from, to, status, serviceCenterId } = req.query;

    let conditions = [];
    let values = [];

    if (from) {
      values.push(from);
      conditions.push(`jc.created_at >= $${values.length}`);
    }

    if (to) {
      values.push(to);
      conditions.push(`jc.created_at <= $${values.length}`);
    }

    if (status) {
      values.push(status);
      conditions.push(`jc.status = $${values.length}`);
    }

    if (serviceCenterId) {
      values.push(serviceCenterId);
      conditions.push(`jc.service_center_id = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT
        jc.id AS job_card_id,
        jc.status,
        jc.created_at,
        jc.start_time,
        jc.end_time,
        jc.total_labor_cost,
        jc.total_parts_cost,

        u.name AS customer_name,
        u.email AS customer_email,

        m.name AS mechanic_name,

        sc.name AS service_center,
        sc.city,

        v.make,
        v.model,
        v.vin

      FROM job_cards jc
      JOIN users u ON u.id = jc.customer_id
      LEFT JOIN users m ON m.id = jc.assigned_mechanic
      JOIN service_centers sc ON sc.id = jc.service_center_id
      JOIN vehicles v ON v.id = jc.vehicle_id
      ${whereClause}
      ORDER BY jc.created_at DESC
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   4️⃣ SERVICE CENTER REPORTS
========================= */

export const getServiceCenterPerformance = async (req, res) => {
  try {
    const { from, to, city } = req.query;

    const params = [];
    let where = "WHERE 1=1";

    if (from) {
      params.push(from);
      where += ` AND jc.created_at >= $${params.length}`;
    }

    if (to) {
      params.push(to);
      where += ` AND jc.created_at <= $${params.length}`;
    }

    if (city) {
      params.push(city);
      where += ` AND sc.city ILIKE '%' || $${params.length} || '%'`;
    }

    const result = await pool.query(
      `
      SELECT
        sc.id,
        sc.name,
        sc.city,
        COUNT(jc.id) AS total_jobs,
        COUNT(CASE WHEN jc.status='completed' THEN 1 END) AS completed_jobs,
        COALESCE(SUM(i.total_amount),0) AS revenue
      FROM service_centers sc
      LEFT JOIN job_cards jc ON jc.service_center_id = sc.id
      LEFT JOIN invoices i ON i.job_card_id = jc.id AND i.status='paid'
      ${where}
      GROUP BY sc.id
      ORDER BY revenue DESC
      `,
      params
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   5️⃣ MECHANIC PERFORMANCE
========================= */

export const getMechanicPerformance = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
  u.name AS mechanic,
  COUNT(jc.id) AS jobs_completed,
  COALESCE(SUM(jt.total_cost),0) AS labor_earned
FROM users u
LEFT JOIN job_cards jc 
  ON jc.assigned_mechanic = u.id 
 AND jc.status='completed'
LEFT JOIN job_tasks jt 
  ON jt.job_card_id = jc.id
WHERE u.role = 'mechanic' 
GROUP BY u.name

    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   6️⃣ CUSTOMER REPORTS
========================= */

export const getCustomerReport = async (req, res) => {
  try {
    const { from, to } = req.query;

    const result = await pool.query(
      `
      SELECT
        u.name AS customer_name,
        COUNT(DISTINCT jc.id) AS total_jobs,
        COALESCE(SUM(i.total_amount), 0) AS total_spent
      FROM users u
      LEFT JOIN job_cards jc 
        ON jc.customer_id = u.id
       AND jc.created_at BETWEEN $1 AND $2
      LEFT JOIN invoices i 
        ON i.job_card_id = jc.id
       AND i.status = 'paid'
      WHERE u.role = 'customer'
      GROUP BY u.id, u.name
      ORDER BY total_spent DESC
      `,
      [from, to]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   7️⃣ PARTS & INVENTORY
========================= */

export const getInventoryReport = async (req, res) => {
  try {
    const { service_center_id, category, from, to } = req.query;

    let query = `
      SELECT
        sc.name AS service_center,
        p.name AS part_name,
        p.category,
        i.quantity,
        i.reorder_level,
        i.updated_at
      FROM inventory i
      JOIN parts p ON p.id = i.part_id
      JOIN service_centers sc ON sc.id = i.service_center_id
      WHERE 1=1
    `;

    const params = [];

    if (service_center_id) {
      params.push(service_center_id);
      query += ` AND i.service_center_id = $${params.length}`;
    }

    if (category) {
      params.push(category);
      query += ` AND p.category = $${params.length}`;
    }

    if (from) {
      params.push(from);
      query += ` AND i.updated_at >= $${params.length}`;
    }

    if (to) {
      params.push(to);
      query += ` AND i.updated_at <= $${params.length}`;
    }

    query += ` ORDER BY i.quantity ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   8️⃣ BOOKINGS & SERVICES
========================= */

export const getBookingsByService = async (req, res) => {
  try {
    const { service_center_id, service_id, from, to } = req.query;
    let query = `
      SELECT
        s.name AS service_name,
        COUNT(*) AS total_bookings
      FROM new_booking_services nbs
      JOIN services s ON s.id = nbs.service_id
      JOIN service_bookings sb ON sb.id = nbs.booking_id
      WHERE 1=1
    `;
    const params = [];

    if (service_center_id) {
      params.push(service_center_id);
      query += ` AND sb.service_center_id = $${params.length}`;
    }

    if (service_id) {
      params.push(service_id);
      query += ` AND s.id = $${params.length}`;
    }

    if (from) {
      params.push(from);
      query += ` AND sb.preferred_date >= $${params.length}`;
    }

    if (to) {
      params.push(to);
      query += ` AND sb.preferred_date <= $${params.length}`;
    }

    query += ` GROUP BY s.name ORDER BY total_bookings DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bookings by Status with optional filters
export const getBookingsByStatus = async (req, res) => {
  try {
    const { service_center_id, from, to } = req.query;
    let query = `
      SELECT
        sb.status,
        COUNT(*) AS count
      FROM service_bookings sb
      WHERE 1=1
    `;
    const params = [];

    if (service_center_id) {
      params.push(service_center_id);
      query += ` AND sb.service_center_id = $${params.length}`;
    }

    if (from) {
      params.push(from);
      query += ` AND sb.preferred_date >= $${params.length}`;
    }

    if (to) {
      params.push(to);
      query += ` AND sb.preferred_date <= $${params.length}`;
    }

    query += ` GROUP BY sb.status ORDER BY sb.status`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* =========================
   9️⃣ LOCATION REPORTS
========================= */

export const getCityWiseRevenue = async (req, res) => {
  try {
    const { from, to } = req.query;

    let query = `
      SELECT
        sc.city,
        COALESCE(SUM(i.total_amount),0) AS revenue
      FROM service_centers sc
      JOIN job_cards jc ON jc.service_center_id = sc.id
      JOIN invoices i ON i.job_card_id = jc.id AND i.status='paid'
    `;

    const params = [];
    if (from && to) {
      query += ` WHERE i.issued_at BETWEEN $1 AND $2`;
      params.push(from, to);
    }

    query += ` GROUP BY sc.city ORDER BY revenue DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   🔟 TIME-BASED REPORTS
========================= */
export const getPeakServiceTime = async (req, res) => {
  try {
    const { service_center_id, from, to } = req.query;

    let filters = [];
    if (service_center_id)
      filters.push(`jc.service_center_id = ${service_center_id}`);
    if (from) filters.push(`jc.created_at >= '${from}'`);
    if (to) filters.push(`jc.created_at <= '${to} 23:59:59'`);

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const result = await pool.query(`
      SELECT
        EXTRACT(HOUR FROM jc.created_at) AS hour,
        COUNT(*) AS jobs
      FROM job_cards jc
      ${whereClause}
      GROUP BY hour
      ORDER BY jobs DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Monthly Trend
export const getMonthlyTrend = async (req, res) => {
  try {
    const { service_center_id, from, to } = req.query;

    let filters = [];
    if (service_center_id) filters.push(`jc.created_at >= '${from}'`);
    if (to) filters.push(`jc.created_at <= '${to} 23:59:59'`);
    if (service_center_id)
      filters.push(`jc.service_center_id = ${service_center_id}`);

    const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

    const result = await pool.query(`
      SELECT
        TO_CHAR(jc.created_at, 'YYYY-MM') AS month,
        COUNT(*) AS jobs
      FROM job_cards jc
      ${whereClause}
      GROUP BY month
      ORDER BY month
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const emailReport = async (req, res) => {
  try {
    const { email, section, filters } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    // TEMP success response
    res.json({
      success: true,
      message: `Report (${section}) sent to ${email}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Email sending failed" });
  }
};

/* =========================
   1️⃣ Fetch Data Dynamically
========================= */
const dummyRes = () => {
  let data;
  return {
    json: (d) => {
      data = d;
    },
    getData: () => data,
  };
};

const SECTION_ALIAS = {
  jobcards: "jobs",
  job_cards: "jobs",

  service_centers: "centers",
  "service-centers": "centers",

  mechanics: "mechanics",
  customers: "customers",
  revenue: "revenue",
  parts: "parts",
};

export const getReportData = async (section, filters = {}) => {
  section = SECTION_ALIAS[section] || section; // ⭐ normalize

  const req = { query: filters };
  const res = dummyRes();

  switch (section) {
    case "revenue":
      await getDetailedRevenueReport(req, res);
      break;

    case "jobs":
      await getDetailedJobReport(req, res);
      break;

    case "centers":
      await getServiceCenterPerformance(req, res);
      break;

    case "mechanics":
      await getMechanicPerformance(req, res);
      break;

    case "customers":
      await getCustomerReport(req, res);
      break;

    case "parts":
      await getInventoryReport(req, res);
      break;

    case "bookings":
      await getBookingsByService(req, res);
      break;

    case "location":
      await getCityWiseRevenue(req, res);
      break;

    case "time":
      await getPeakServiceTime(req, res);
      break;

    default:
      throw new Error(`Invalid report section: ${section}`);
  }

  return res.getData();
};

/* =========================
   2️⃣ Export PDF
========================= */
export const exportReportPDF = async (req, res) => {
  try {
    const { section, filters } = req.body;
    const data = await getReportData(section, filters);

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${section}_report.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc
      .fontSize(18)
      .text(`${section.toUpperCase()} REPORT`, { align: "center" });
    doc.moveDown();

    if (!data || data.length === 0) {
      doc.text("No data available");
    } else {
      const headers = Object.keys(data[0]);
      data.forEach((row) => {
        headers.forEach((h) => doc.text(`${h}: ${row[h] ?? "-"}`));
        doc.moveDown();
      });
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   3️⃣ Export Excel
========================= */
export const exportReportExcel = async (req, res) => {
  try {
    const { section, filters } = req.body;
    const data = await getReportData(section, filters);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Report");

    if (!data || data.length === 0) {
      sheet.addRow(["No data available"]);
    } else {
      sheet.columns = Object.keys(data[0]).map((k) => ({
        header: k.toUpperCase(),
        key: k,
        width: 20,
      }));
      data.forEach((row) => sheet.addRow(row));
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${section}_report.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   4️⃣ Send Email with PDF
========================= */
export const sendReportEmail = async (req, res) => {
  try {
    const { email, section, filters } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    // 🔹 Get report data
    const data = await getReportData(section, filters);

    // 🔹 Create Excel in memory
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Report");

    if (!data || data.length === 0) {
      sheet.addRow(["No data available"]);
    } else {
      sheet.columns = Object.keys(data[0]).map((k) => ({
        header: k.replace(/_/g, " ").toUpperCase(),
        key: k,
        width: 22,
      }));

      data.forEach((row) => sheet.addRow(row));
      sheet.getRow(1).font = { bold: true };
    }

    const buffer = await workbook.xlsx.writeBuffer();

    // 🔹 Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🔹 Professional Email
    await transporter.sendMail({
      from: `"Service Reports" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `${section.toUpperCase()} Report send by SVMMS`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6">
        <h2 style="color:#2563eb"> SMART VEHICLE MAINTENANCE
AND SERVICE MANAGEMENT SYSTEM (SVMMS)</h2>
          <h2 style="color:#2563eb">${section.toUpperCase()} Report</h2>
          <p>Hello,</p>
          <p>
            Please find attached the <b>${section}</b> report generated from the system.
          </p>
          <p>
            If you have any questions or need additional information, feel free to reply to this email.
          </p>
          <br/>
          <p>Regards,<br/>
          <b>SVMMS</b></p>
        </div>
      `,
      attachments: [
        {
          filename: `${section}_report.xlsx`,
          content: buffer,
        },
      ],
    });

    res.json({
      success: true,
      message: "Excel report emailed successfully",
    });
  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ message: err.message });
  }
};
