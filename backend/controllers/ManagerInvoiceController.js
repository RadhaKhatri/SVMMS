import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import pool from "../db.js";

/* ===============================
   EMAIL TRANSPORTER (SHARED)
================================ */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/* =========================================
   GET ALL INVOICES (CUSTOMER)
========================================= */
export const getManagerInvoices = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        i.id,
        i.invoice_number,
        i.status,
        i.issued_at,
        i.total_amount,

        sb.service_type,

        v.make,
        v.model,
        v.year,
        v.vin

      FROM invoices i
      JOIN job_cards jc ON jc.id = i.job_card_id
      JOIN service_bookings sb ON sb.id = jc.booking_id
      JOIN vehicles v ON v.id = sb.vehicle_id
      JOIN service_centers sc ON sc.id = sb.service_center_id

      WHERE sc.manager_id = $1
      ORDER BY i.issued_at DESC
      `,
      [req.user.id]
    );

    res.json(
      result.rows.map((r) => ({
        id: r.id,
        invoice_number: r.invoice_number,
        status: r.status,
        issued_at: r.issued_at,
        total_amount: Number(r.total_amount),

        vehicle: {
          make: r.make,
          model: r.model,
          year: r.year,
          vin: r.vin,
        },

        services: r.service_type ? [r.service_type] : [],
      }))
    );
  } catch (err) {
    console.error("Get manager invoices error:", err);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};

/* =========================================
   GET SINGLE INVOICE (FULL DETAILS)
========================================= */
export const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;

    const result = await pool.query(
      `
      SELECT
  i.id AS invoice_id,
  i.invoice_number,
  i.status,
  i.issued_at,
  i.labor_total,
  i.parts_total,
  i.tax,
  i.discount,
  i.total_amount,

  jc.id AS job_card_id,

  sb.preferred_date,
  sb.preferred_time,

  v.make,
  v.model,
  v.year,
  v.engine_type,
  v.vin,
  v.mileage,

  /* ✅ STRONG NAME LOGIC */
  COALESCE(
    NULLIF(TRIM(cu.first_name || ' ' || cu.last_name), ''),
    cu.name
  ) AS customer_name,

  cu.email AS customer_email,
  cu.phone AS customer_phone,

  me.id AS mechanic_id,
  COALESCE(
    NULLIF(TRIM(me.first_name || ' ' || me.last_name), ''),
    me.name
  ) AS mechanic_name,

  sc.name AS service_center_name,
  sc.address AS service_center_address,
  sc.city,

  /* ✅ STRONG SERVICE LOGIC */
  COALESCE(
    (
      SELECT ARRAY_AGG(s.name ORDER BY s.name)
      FROM new_booking_services nbs
      JOIN services s ON s.id = nbs.service_id
      WHERE nbs.booking_id = sb.id
    ),
    '{}'
  ) AS services

FROM invoices i
JOIN job_cards jc ON jc.id = i.job_card_id
JOIN service_bookings sb ON sb.id = jc.booking_id
JOIN vehicles v ON v.id = sb.vehicle_id
JOIN users cu ON cu.id = sb.customer_id
LEFT JOIN users me ON me.id = jc.assigned_mechanic
JOIN service_centers sc ON sc.id = sb.service_center_id

WHERE i.id = $1
  AND sc.manager_id = $2;
      `,
      [id, managerId]
    );

    console.log("Invoice query result:", result.rows); // ✅ log result

    if (!result.rows.length) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const r = result.rows[0];
    console.log("SERVICES (service_type):", r.service_type); // ✅ check service_type
    console.log("SERVICES:", r.services); // should be array

    res.json({
      id: r.invoice_id,
      invoice_number: r.invoice_number,
      status: r.status,
      issued_at: r.issued_at,

      customer: {
        name: r.customer_name,
        email: r.customer_email,
        phone: r.customer_phone,
      },

      vehicle: {
        make: r.make,
        model: r.model,
        year: r.year,
        engine_type: r.engine_type,
        vin: r.vin,
        mileage: r.mileage,
      },

      service_center: {
        name: r.service_center_name,
        address: r.service_center_address,
        city: r.city,
      },

      mechanic: {
        id: r.mechanic_id,
        name: r.mechanic_name,
      },

      services: r.services, // ✅ always array

      costs: {
        labor: Number(r.labor_total),
        parts: Number(r.parts_total),
        tax: Number(r.tax),
        discount: Number(r.discount),
        total: Number(r.total_amount),
      },
    });
  } catch (err) {
    console.error("Invoice detail error:", err);
    res.status(500).json({ message: "Failed to load invoice" });
  }
};

export const downloadInvoicePDF = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `
      SELECT
        i.invoice_number,
        i.labor_total,
        i.parts_total,
        i.tax,
        i.discount,
        i.total_amount,
        i.status,
        i.issued_at,

        /* ✅ STRONG NAME */
        COALESCE(
          NULLIF(TRIM(cu.first_name || ' ' || cu.last_name), ''),
          cu.name
        ) AS customer_name,
        cu.email,
        cu.phone,

        v.make,
        v.model,
        v.year,
        v.vin,

        /* ✅ STRONG SERVICES */
        COALESCE(
          (
            SELECT ARRAY_AGG(s.name ORDER BY s.name)
            FROM new_booking_services nbs
            JOIN services s ON s.id = nbs.service_id
            WHERE nbs.booking_id = sb.id
          ),
          '{}'
        ) AS services,

        sc.name AS service_center_name,
        sc.address AS service_center_address,
        sc.city

      FROM invoices i
      JOIN job_cards jc ON jc.id = i.job_card_id
      JOIN service_bookings sb ON sb.id = jc.booking_id
      JOIN users cu ON cu.id = sb.customer_id
      JOIN vehicles v ON v.id = sb.vehicle_id
      JOIN service_centers sc ON sc.id = sb.service_center_id

      WHERE i.id = $1
        AND sc.manager_id = $2
      `,
      [id, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const inv = rows[0];

    const num = (v) => Number(v || 0);

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Invoice-${inv.invoice_number}.pdf`,
    });

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(res);

    /* ================= HEADER ================= */
    doc.fontSize(22).fillColor("#0f172a").text("SVMMS PRO", 40, 40);

    doc
      .fontSize(10)
      .fillColor("#475569")
      .text(inv.service_center_name, 40, 70)
      .text(`${inv.service_center_address}, ${inv.city}`, 40, 85);

    doc
      .fontSize(14)
      .fillColor("#0f172a")
      .text(`INVOICE`, 400, 40, { align: "right" });

    doc
      .fontSize(10)
      .text(`Invoice #: ${inv.invoice_number}`, 400, 65, { align: "right" })
      .text(`Date: ${new Date(inv.issued_at).toLocaleDateString()}`, 400, 80, {
        align: "right",
      })
      .text(`Status: ${inv.status.toUpperCase()}`, 400, 95, {
        align: "right",
      });

    doc.moveTo(40, 120).lineTo(555, 120).stroke();

    /* ================= CUSTOMER & VEHICLE ================= */
    let y = 140;

    doc.fontSize(11).fillColor("#020617").text("Bill To:", 40, y);
    doc.fontSize(10).fillColor("#334155");
    doc.text(inv.customer_name, 40, y + 15);
    doc.text(inv.email, 40, y + 30);
    doc.text(inv.phone, 40, y + 45);

    doc.fontSize(11).fillColor("#020617").text("Vehicle Details:", 320, y);
    doc.fontSize(10).fillColor("#334155");
    doc.text(`${inv.make} ${inv.model} (${inv.year})`, 320, y + 15);
    doc.text(`VIN: ${inv.vin}`, 320, y + 30);
    doc.text(
      `Service: ${inv.services.length ? inv.services.join(", ") : "—"}`,
      320,
      y + 45
    );

    /* ================= TABLE HEADER ================= */
    y = 220;

    doc.rect(40, y, 515, 25).fill("#f1f5f9").stroke();

    doc.fillColor("#020617").fontSize(11);
    doc.text("Description", 50, y + 7);
    doc.text("Amount", 450, y + 7, { align: "right" });

    /* ================= TABLE ROWS ================= */
    const row = (label, value, bold = false) => {
      y += 28;
      doc.font(bold ? "Helvetica-Bold" : "Helvetica");
      doc.fillColor("#020617").fontSize(10);
      doc.text(label, 50, y);
      doc.text(`Rs ${num(value).toFixed(2)}`, 450, y, { align: "right" });
      doc
        .moveTo(40, y + 18)
        .lineTo(555, y + 18)
        .strokeColor("#e2e8f0")
        .stroke();
    };

    row("Labor Charges", inv.labor_total);
    row("Parts & Materials", inv.parts_total);
    row("Subtotal", num(inv.labor_total) + num(inv.parts_total), true);
    row("Tax", inv.tax);
    row("Discount", inv.discount);

    y += 30;
    doc.rect(40, y, 515, 30).fill("#e0f2fe").stroke();

    doc.font("Helvetica-Bold").fontSize(12).fillColor("#0c4a6e");
    doc.text("TOTAL AMOUNT", 50, y + 8);
    doc.text(`Rs ${num(inv.total_amount).toFixed(2)}`, 450, y + 8, {
      align: "right",
    });

    /* ================= FOOTER ================= */
    doc
      .fontSize(10)
      .fillColor("#64748b")
      .text(
        "Thank you for choosing SVMMS Pro. This is a system generated invoice.",
        40,
        770,
        { align: "center", width: 515 }
      );

    doc.end();
  } catch (err) {
    console.error("INVOICE PDF ERROR:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Invoice PDF generation failed" });
    }
  }
};

/* =========================================
   GENERATE INVOICE PDF (BUFFER – CLEAN)
========================================= */
const generateInvoicePDF = async (invoiceId, managerId) => {
  const { rows } = await pool.query(
    `
    SELECT
      i.invoice_number,
      i.labor_total,
      i.parts_total,
      i.tax,
      i.discount,
      i.total_amount,
      i.status,
      i.issued_at,

      COALESCE(
        NULLIF(TRIM(cu.first_name || ' ' || cu.last_name), ''),
        cu.name
      ) AS customer_name,
      cu.email,
      cu.phone,

      v.make,
      v.model,
      v.year,
      v.vin,

      COALESCE(
        (
          SELECT ARRAY_AGG(s.name ORDER BY s.name)
          FROM new_booking_services nbs
          JOIN services s ON s.id = nbs.service_id
          WHERE nbs.booking_id = sb.id
        ),
        '{}'
      ) AS services,

      sc.name AS service_center_name,
      sc.address AS service_center_address,
      sc.city

    FROM invoices i
    JOIN job_cards jc ON jc.id = i.job_card_id
    JOIN service_bookings sb ON sb.id = jc.booking_id
    JOIN users cu ON cu.id = sb.customer_id
    JOIN vehicles v ON v.id = sb.vehicle_id
    JOIN service_centers sc ON sc.id = sb.service_center_id

    WHERE i.id = $1 AND sc.manager_id = $2
    `,
    [invoiceId, managerId]
  );

  if (!rows.length) throw new Error("Invoice not found");

  const inv = rows[0];
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const buffers = [];

  doc.on("data", buffers.push.bind(buffers));

  const money = (v) => `Rs ${Number(v || 0).toFixed(2)}`;

  /* ================= HEADER ================= */
  doc.fontSize(22).fillColor("#0f172a").text("SVMMS PRO", 40, 40);

  doc
    .fontSize(10)
    .fillColor("#475569")
    .text(inv.service_center_name, 40, 70)
    .text(`${inv.service_center_address}, ${inv.city}`, 40, 85);

  doc
    .fontSize(14)
    .fillColor("#0f172a")
    .text("INVOICE", 400, 40, { align: "right" });

  doc
    .fontSize(10)
    .text(`Invoice #: ${inv.invoice_number}`, 400, 65, { align: "right" })
    .text(`Date: ${new Date(inv.issued_at).toLocaleDateString()}`, 400, 80, {
      align: "right",
    })
    .text(`Status: ${inv.status.toUpperCase()}`, 400, 95, {
      align: "right",
    });

  doc.moveTo(40, 120).lineTo(555, 120).stroke();

  /* ================= CUSTOMER & VEHICLE ================= */
  let y = 140;

  doc.fontSize(11).fillColor("#020617").text("Bill To:", 40, y);
  doc.fontSize(10).fillColor("#334155");
  doc.text(inv.customer_name, 40, y + 15);
  doc.text(inv.email, 40, y + 30);
  doc.text(inv.phone, 40, y + 45);

  doc.fontSize(11).fillColor("#020617").text("Vehicle Details:", 320, y);
  doc.fontSize(10).fillColor("#334155");
  doc.text(`${inv.make} ${inv.model} (${inv.year})`, 320, y + 15);
  doc.text(`VIN: ${inv.vin}`, 320, y + 30);
  doc.text(
    `Services: ${inv.services.length ? inv.services.join(", ") : "—"}`,
    320,
    y + 45
  );

  /* ================= TABLE HEADER ================= */
  y = 220;

  doc.rect(40, y, 515, 25).fill("#f1f5f9");
  doc.fillColor("#020617").fontSize(11);
  doc.text("Description", 50, y + 7);
  doc.text("Amount", 450, y + 7, { align: "right" });

  /* ================= TABLE ROWS ================= */
  const row = (label, value, bold = false) => {
    y += 28;
    doc.font(bold ? "Helvetica-Bold" : "Helvetica");
    doc.fontSize(10).fillColor("#020617");
    doc.text(label, 50, y);
    doc.text(money(value), 450, y, { align: "right" });
    doc
      .moveTo(40, y + 18)
      .lineTo(555, y + 18)
      .strokeColor("#e2e8f0")
      .stroke();
  };

  row("Labor Charges", inv.labor_total);
  row("Parts & Materials", inv.parts_total);
  row("Subtotal", Number(inv.labor_total) + Number(inv.parts_total), true);
  row("Tax", inv.tax);
  row("Discount", inv.discount);

  /* ================= TOTAL ================= */
  y += 30;
  doc.rect(40, y, 515, 30).fill("#e0f2fe");

  doc.font("Helvetica-Bold").fontSize(12).fillColor("#0c4a6e");
  doc.text("TOTAL AMOUNT", 50, y + 8);
  doc.text(money(inv.total_amount), 450, y + 8, { align: "right" });

  /* ================= FOOTER ================= */
  doc
    .fontSize(10)
    .fillColor("#64748b")
    .text(
      "Thank you for choosing SVMMS Pro. This is a system generated invoice.",
      40,
      770,
      { align: "center", width: 515 }
    );

  doc.end();

  return await new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });
};

export const sendInvoiceByEmail = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;
  const managerId = req.user.id;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    /* 1️⃣ Verify manager owns invoice */
    const { rows } = await pool.query(
      `
      SELECT i.invoice_number
      FROM invoices i
      JOIN job_cards jc ON jc.id = i.job_card_id
      JOIN service_centers sc ON sc.id = jc.service_center_id
      WHERE i.id = $1 AND sc.manager_id = $2
      `,
      [id, managerId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoice = rows[0];

    /* 2️⃣ Generate PDF */
    const pdfBuffer = await generateInvoicePDF(id, managerId);

    /* 3️⃣ Send email */
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"SVMMS Pro" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Invoice ${invoice.invoice_number}`,
      html: `
        <p>Hello,</p>
        <p>Please find attached the service invoice.</p>
        <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
      `,
      attachments: [
        {
          filename: `Invoice-${invoice.invoice_number}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    res.json({ message: "Invoice sent successfully" });
  } catch (err) {
    console.error("Manager invoice email error:", err);
    res.status(500).json({ message: "Failed to send invoice email" });
  }
};

/* =========================================
   MARK INVOICE AS PAID (MANAGER)
========================================= */
export const markInvoiceAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const managerId = req.user.id;

    // ✅ Ensure invoice belongs to manager & is unpaid
    const check = await pool.query(
      `
      SELECT i.id
      FROM invoices i
      JOIN job_cards jc ON jc.id = i.job_card_id
      JOIN service_centers sc ON sc.id = jc.service_center_id
      WHERE i.id = $1
        AND sc.manager_id = $2
        AND i.status = 'unpaid'
      `,
      [id, managerId]
    );

    if (!check.rows.length) {
      return res.status(404).json({
        message: "Invoice not found or already paid",
      });
    }

    // ✅ Update status
    await pool.query(
      `
      UPDATE invoices
      SET status = 'paid'
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      message: "Invoice marked as paid successfully",
    });
  } catch (err) {
    console.error("Mark invoice paid error:", err);
    res.status(500).json({
      message: "Failed to update invoice status",
    });
  }
};
