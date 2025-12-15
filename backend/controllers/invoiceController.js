import pool from "../db.js";

/* =========================================
   GET ALL INVOICES (CUSTOMER)
========================================= */
export const getMyInvoices = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        i.id,
        i.invoice_number,
        i.parts_total,
        i.labor_total,
        i.tax,
        i.discount,
        i.total_amount,
        i.status,
        i.issued_at,

        jc.id AS job_card_id,

        v.make,
        v.model,
        v.year,
        v.vin,

        sb.service_type,

        sc.name AS service_center_name
      FROM invoices i
      JOIN job_cards jc ON jc.id = i.job_card_id
      JOIN service_bookings sb ON sb.id = jc.booking_id
      JOIN vehicles v ON v.id = jc.vehicle_id
      JOIN service_centers sc ON sc.id = jc.service_center_id
      WHERE jc.customer_id = $1
      ORDER BY i.issued_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get invoices error:", err);
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
};

/* =========================================
   GET SINGLE INVOICE (FULL DETAILS)
========================================= */
export const getInvoiceById = async (req, res) => {
  const { id } = req.params;

  try {
    /* 🔹 Invoice + customer + vehicle */
    const invoiceRes = await pool.query(
      `
      SELECT
        i.*,

        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.address,

        v.make,
        v.model,
        v.year,
        v.vin,

        sc.name AS service_center_name,
        sc.address AS service_center_address,
        sc.city,
        sc.contact_number
      FROM invoices i
      JOIN job_cards jc ON jc.id = i.job_card_id
      JOIN users u ON u.id = jc.customer_id
      JOIN vehicles v ON v.id = jc.vehicle_id
      JOIN service_centers sc ON sc.id = jc.service_center_id
      WHERE i.id = $1 AND jc.customer_id = $2
      `,
      [id, req.user.id]
    );

    if (invoiceRes.rows.length === 0) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoice = invoiceRes.rows[0];

    /* 🔹 Labor Tasks */
    const laborRes = await pool.query(
      `
      SELECT
        description,
        hours,
        labor_rate,
        total_cost
      FROM job_tasks
      WHERE job_card_id = $1
      `,
      [invoice.job_card_id]
    );

    /* 🔹 Parts Used */
    const partsRes = await pool.query(
      `
      SELECT
        p.name,
        jp.quantity_used,
        jp.unit_price,
        jp.total_price
      FROM job_parts jp
      JOIN parts p ON p.id = jp.part_id
      WHERE jp.job_card_id = $1
      `,
      [invoice.job_card_id]
    );

    res.json({
      invoice,
      labor: laborRes.rows,
      parts: partsRes.rows
    });

  } catch (err) {
    console.error("Invoice detail error:", err);
    res.status(500).json({ message: "Failed to fetch invoice details" });
  }
};
