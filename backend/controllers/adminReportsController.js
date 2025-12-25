import pool from "../db.js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

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

    const result = await pool.query(`
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
    `, params);

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
      LEFT JOIN job_cards jc ON jc.assigned_mechanic = u.id AND jc.status='completed'
      LEFT JOIN job_tasks jt ON jt.job_card_id = jc.id
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

export const getTopCustomers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.name,
        COUNT(jc.id) AS total_jobs,
        COALESCE(SUM(i.total_amount),0) AS total_spent
      FROM users u
      JOIN job_cards jc ON jc.customer_id = u.id
      JOIN invoices i ON i.job_card_id = jc.id AND i.status='paid'
      GROUP BY u.name
      ORDER BY total_spent DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   7️⃣ PARTS & INVENTORY
========================= */

export const getLowStockReport = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        sc.name AS service_center,
        p.name AS part_name,
        i.quantity,
        i.reorder_level
      FROM inventory i
      JOIN parts p ON p.id = i.part_id
      JOIN service_centers sc ON sc.id = i.service_center_id
      WHERE i.quantity <= i.reorder_level
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   8️⃣ BOOKINGS & SERVICES
========================= */

export const getBookingsByService = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        s.name AS service,
        COUNT(*) AS bookings
      FROM new_booking_services nbs
      JOIN services s ON s.id = nbs.service_id
      GROUP BY s.name
    `);
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
    const result = await pool.query(`
      SELECT
        sc.city,
        COALESCE(SUM(i.total_amount),0) AS revenue
      FROM service_centers sc
      JOIN job_cards jc ON jc.service_center_id = sc.id
      JOIN invoices i ON i.job_card_id = jc.id AND i.status='paid'
      GROUP BY sc.city
    `);
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
    const result = await pool.query(`
      SELECT
        EXTRACT(HOUR FROM created_at) AS hour,
        COUNT(*) AS jobs
      FROM job_cards
      GROUP BY hour
      ORDER BY jobs DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMonthlyTrend = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') AS month,
        COUNT(*) AS jobs
      FROM job_cards
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
      message: `Report (${section}) sent to ${email}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Email sending failed" });
  }
};

export const getReportData = async (section, filters) => {
  const { startDate, endDate, city, serviceCenter } = filters;

  const params = [];
  let where = "WHERE 1=1";

  if (startDate) {
    params.push(startDate);
    where += ` AND inv.issued_at >= $${params.length}`;
  }

  if (endDate) {
    params.push(endDate);
    where += ` AND inv.issued_at <= $${params.length}`;
  }

  if (city) {
    params.push(city);
    where += ` AND sc.city ILIKE '%' || $${params.length} || '%'`;
  }

  if (serviceCenter) {
    params.push(serviceCenter);
    where += ` AND sc.name ILIKE '%' || $${params.length} || '%'`;
  }

  const queries = {
    revenue: `
      SELECT
        inv.invoice_number,
        inv.issued_at AS date,
        u.name AS customer,
        sc.name AS service_center,
        sc.city,
        inv.labor_total,
        inv.parts_total,
        inv.tax,
        inv.discount,
        inv.total_amount
      FROM invoices inv
      JOIN job_cards jc ON inv.job_card_id = jc.id
      JOIN users u ON jc.customer_id = u.id
      JOIN service_centers sc ON jc.service_center_id = sc.id
      ${where}
      ORDER BY inv.issued_at DESC
    `,

    customers: `
      SELECT
        u.name,
        u.email,
        COUNT(inv.id) AS total_jobs,
        SUM(inv.total_amount) AS total_spent
      FROM users u
      JOIN job_cards jc ON u.id = jc.customer_id
      JOIN invoices inv ON jc.id = inv.job_card_id
      ${where}
      GROUP BY u.id
      ORDER BY total_spent DESC
    `,
  };

  if (!queries[section]) {
    throw new Error("Invalid report section");
  }

  const { rows } = await pool.query(queries[section], params);
  return rows;
};

export const exportReportExcel = async (req, res) => {
   console.log("PDF EXPORT HIT", req.body);
  try {
    const { section, filters } = req.body;
    const data = await getReportData(section, filters);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Report");

    if (data.length === 0) {
      sheet.addRow(["No data available"]);
    } else {
      sheet.columns = Object.keys(data[0]).map(key => ({
        header: key.toUpperCase(),
        key,
        width: 20,
      }));

      data.forEach(row => sheet.addRow(row));
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
    res.status(500).json({ message: err.message });
  }
};

export const exportReportPDF = async (req, res) => {
  console.log("EXCEL EXPORT HIT", req.body);
  try {
    const { section, filters } = req.body;
    const data = await getReportData(section, filters);

    const doc = new PDFDocument({ margin: 30, size: "A4" });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${section}_report.pdf`
    );
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    doc.fontSize(18).text(`${section.toUpperCase()} REPORT`, { align: "center" });
    doc.moveDown();

    data.forEach(row => {
      Object.entries(row).forEach(([k, v]) => {
        doc.fontSize(10).text(`${k}: ${v}`);
      });
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const sendReportEmail = async (req, res) => {
  console.log("EMAIL HIT", req.body);
  try {
    const { email, section, filters } = req.body;
    const data = await getReportData(section, filters);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const content = data
      .map(row =>
        Object.entries(row)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      )
      .join("\n");

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${section.toUpperCase()} Report`,
      text: content,
    });

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};