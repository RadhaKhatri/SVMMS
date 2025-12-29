import pool from "../db.js";
import { io } from "../server.js";

/* ================================
   1️⃣ GET MANAGER SERVICE CENTER
================================ */
export const getMyServiceCenter = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM service_centers
      WHERE manager_id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json(null); // manager not registered yet
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch service center" });
  }
};

/* ================================
   2️⃣ REGISTER SERVICE CENTER
================================ */
export const registerServiceCenter = async (req, res) => {
  const { name, address, city, contact_number } = req.body;

  if (!name || !address || !city) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    const existing = await pool.query(
      `SELECT id FROM service_centers WHERE manager_id = $1`,
      [req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Service center already exists" });
    }

    const result = await pool.query(
      `
      INSERT INTO service_centers
      (name, address, city, contact_number, manager_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [name, address, city, contact_number || null, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Service center registration failed" });
  }
};

/* ================================
   3️⃣ GET PENDING BOOKINGS
================================ */
export const getPendingBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT sb.id,
             sb.preferred_date,
             sb.preferred_time,
             sb.status,
             sb.remarks,
             u.name AS customer_name,
             v.make,
             v.model,
             v.year,
             ARRAY_AGG(s.name) AS services
      FROM service_bookings sb
      JOIN users u ON u.id = sb.customer_id
      JOIN vehicles v ON v.id = sb.vehicle_id
      LEFT JOIN new_booking_services nbs ON nbs.booking_id = sb.id
      LEFT JOIN services s ON s.id = nbs.service_id
      WHERE sb.service_center_id = (
        SELECT id FROM service_centers WHERE manager_id = $1
      )
      AND sb.status = 'pending'
      GROUP BY sb.id, u.id, v.id
      ORDER BY sb.created_at ASC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

/* ================================
   4️⃣ APPROVE BOOKING + CREATE JOB CARD
================================ */
export const approveBooking = async (req, res) => {
  const { id } = req.params;
  const { mechanic_id } = req.body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const bookingRes = await client.query(
      `
      SELECT * 
      FROM service_bookings
      WHERE id = $1
      AND service_center_id = (
        SELECT id FROM service_centers WHERE manager_id = $2
      )
      `,
      [id, req.user.id]
    );

    if (bookingRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = bookingRes.rows[0];

    await client.query(
      `
      UPDATE service_bookings
      SET status = 'approved',
          approved_by = $1,
          updated_at = NOW()
      WHERE id = $2
      `,
      [req.user.id, id]
    );

    await client.query(
      `
      INSERT INTO job_cards
      (booking_id, service_center_id, vehicle_id, customer_id, assigned_mechanic, status)
      VALUES ($1, $2, $3, $4, $5, 'open')
      `,
      [
        booking.id,
        booking.service_center_id,
        booking.vehicle_id,
        booking.customer_id,
        mechanic_id || null
      ]
    );

   // ✅ ADD THIS HERE
if (mechanic_id) {
  await client.query(
  `
  INSERT INTO mechanic_profiles (user_id, availability_status)
  VALUES ($1, 'busy')
  ON CONFLICT (user_id)
  DO UPDATE SET
    availability_status = 'busy',
    updated_at = NOW()
  `,
  [mechanic_id]
);
}

    await client.query("COMMIT");

    res.json({ message: "Booking approved & job card created" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Approval failed" });
  } finally {
    client.release();
  }
};

/* ================================
   5️⃣ REJECT BOOKING
================================ */
export const rejectBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      UPDATE service_bookings
      SET status = 'rejected', updated_at = NOW()
      WHERE id = $1
      AND service_center_id = (
        SELECT id FROM service_centers WHERE manager_id = $2
      )
      `,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reject failed" });
  }
};

/* ================================
   6️⃣ GET SERVICE CENTER MECHANICS
================================ */
export const getMyMechanics = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
  u.id,
  u.name,
  mp.hourly_rate,
  COALESCE(mp.availability_status, 'available') AS availability_status,
  COUNT(jc.id) FILTER (WHERE jc.status = 'open') AS jobs
FROM service_center_mechanics scm
JOIN users u ON u.id = scm.mechanic_id
LEFT JOIN mechanic_profiles mp ON mp.user_id = u.id
LEFT JOIN job_cards jc 
  ON jc.assigned_mechanic = u.id
 AND jc.status = 'open'
WHERE scm.service_center_id = (
  SELECT id FROM service_centers WHERE manager_id = $1
)
AND scm.status = 'approved'
GROUP BY u.id, mp.hourly_rate, mp.availability_status
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch mechanics" });
  }
};


/* ============================
   GET MANAGER PROFILE
============================ */
export const getManagerProfile = async (req, res) => {
  console.log("Authenticated user:", req.user);

  try {
    if (req.user.role !== "service_center_manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.address,
        sc.id AS service_center_id,
        sc.name AS service_center_name,
        sc.address AS service_center_address,
        sc.city,
        sc.contact_number
      FROM users u
      LEFT JOIN service_centers sc
        ON sc.manager_id = u.id
      WHERE u.id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Manager not found" });
    }

    const row = result.rows[0];

    // Use name if first_name/last_name are missing
    const first_name = row.first_name || row.name || "";
    const last_name = row.last_name || ""; // leave blank if no last name

    res.json({
      manager: {
        id: row.id,
        first_name,
        last_name,
        email: row.email,
        phone: row.phone,
        address: row.address,
      },
      service_center: row.service_center_id
        ? {
            id: row.service_center_id,
            name: row.service_center_name,
            address: row.service_center_address,
            city: row.city,
            contact_number: row.contact_number,
          }
        : null,
    });
  } catch (err) {
    console.error("Get manager profile error:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
};

export const updateManagerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone, address } = req.body;

    const result = await pool.query(
      `
      UPDATE users
      SET first_name = $1,
          last_name = $2,
          phone = $3,
          address = $4,
          updated_at = NOW()
      WHERE id = $5
      RETURNING id, first_name, last_name, email, phone, address
      `,
      [first_name, last_name, phone, address, userId]
    );

    res.json({
      message: "Profile updated successfully",
      manager: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};  

export const getJobCardsList = async (req, res) => {
  try {
    if (req.user.role !== "service_center_manager") {
      return res.status(403).json({ message: "Access denied" });
    }

    const managerId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        jc.id AS job_card_id,
        jc.status,
        jc.created_at,

        ARRAY_AGG(DISTINCT s.name) AS service_type,

        v.make || ' ' || v.model AS vehicle,

        COALESCE(cu.first_name || ' ' || cu.last_name, cu.name) AS customer_name,

        COALESCE(me.first_name || ' ' || me.last_name, me.name) AS mechanic_name

      FROM job_cards jc
      JOIN service_centers sc ON sc.id = jc.service_center_id
      JOIN service_bookings sb ON sb.id = jc.booking_id
      LEFT JOIN new_booking_services nbs ON nbs.booking_id = sb.id
      LEFT JOIN services s ON s.id = nbs.service_id
      JOIN vehicles v ON v.id = jc.vehicle_id
      JOIN users cu ON cu.id = jc.customer_id
      LEFT JOIN users me ON me.id = jc.assigned_mechanic

      WHERE sc.manager_id = $1
      GROUP BY jc.id, v.make, v.model, cu.id, me.id
      ORDER BY jc.created_at DESC;
      `,
      [managerId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get Job Cards error:", err);
    res.status(500).json({ message: "Failed to fetch job cards" });
  }
};

export const getJobCardDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        jc.id,
        jc.status,
        jc.start_time,
        jc.end_time,
        jc.notes,
        jc.total_labor_cost,
        jc.total_parts_cost,

        sb.service_type,
        sb.preferred_date,
        sb.preferred_time,

        v.make,
        v.model,
        v.year,
        v.engine_type,
        v.vin,
        v.mileage,

        COALESCE(cu.first_name || ' ' || cu.last_name, cu.name) AS customer_name,
        cu.email,
        cu.phone,

        me.id AS mechanic_id,
        COALESCE(me.first_name || ' ' || me.last_name, me.name) AS mechanic_name,

        (
          SELECT ARRAY_AGG(s.name)
          FROM new_booking_services nbs
          JOIN services s ON s.id = nbs.service_id
          WHERE nbs.booking_id = sb.id
        ) AS services

      FROM job_cards jc
      JOIN service_bookings sb ON sb.id = jc.booking_id
      JOIN vehicles v ON v.id = jc.vehicle_id
      JOIN users cu ON cu.id = jc.customer_id
      LEFT JOIN users me ON me.id = jc.assigned_mechanic
      WHERE jc.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Job card not found" });
    }

    const r = result.rows[0];

    res.json({
      id: r.id,
      status: r.status,

      timeline: {
        preferred_date: r.preferred_date,
        preferred_time: r.preferred_time,
        start_time: r.start_time,
        end_time: r.end_time,
      },

      customer: {
        name: r.customer_name,
        phone: r.phone,
        email: r.email,
      },

      vehicle: {
        make: r.make,
        model: r.model,
        year: r.year,
        engine_type: r.engine_type,
        vin: r.vin,
        mileage: r.mileage,
      },

      mechanic: {
        id: r.mechanic_id,
        name: r.mechanic_name,
      },

      services: r.services || [],

      costs: {
        labor: Number(r.total_labor_cost),
        parts: Number(r.total_parts_cost),
      },

      notes: r.notes,
    });
  } catch (err) {
    console.error("Job card detail error:", err);
    res.status(500).json({ message: "Failed to load job card" });
  }
};


export const getPendingMechanicRequests = async (req, res) => {
  const managerId = req.user.id;

  const result = await pool.query(
    `SELECT scm.id, u.name AS mechanic, sc.name AS center
     FROM service_center_mechanics scm
     JOIN users u ON u.id = scm.mechanic_id
     JOIN service_centers sc ON sc.id = scm.service_center_id
     WHERE scm.status = 'pending'
       AND sc.manager_id = $1`,
    [managerId]
  );

  res.json(result.rows);
};


export const approveMechanic = async (req, res) => {
  await pool.query(
    `UPDATE service_center_mechanics
     SET status='approved', reviewed_at=NOW()
     WHERE id=$1`,
    [req.params.id]
  );

  res.json({ message: "Mechanic approved" });
};

export const rejectMechanic = async (req, res) => {
  await pool.query(
    `UPDATE service_center_mechanics
     SET status='rejected', reviewed_at=NOW()
     WHERE id=$1`,
    [req.params.id]
  );

  res.json({ message: "Mechanic rejected" });
};

/* ================================
   7️⃣ DASHBOARD STATS
================================ */
export const getDashboardStats = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE jc.status = 'open') AS in_progress,
        COUNT(*) FILTER (
          WHERE jc.status = 'completed'
          AND DATE(jc.end_time) = CURRENT_DATE
        ) AS completed_today
      FROM job_cards jc
      WHERE jc.service_center_id = (
        SELECT id FROM service_centers WHERE manager_id = $1
      )
      `,
      [req.user.id]
    );

    res.json({
      inProgress: Number(result.rows[0].in_progress),
      completedToday: Number(result.rows[0].completed_today),
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

export const getInventory = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        i.id,
         i.part_id,
        p.name,
        p.part_code,
        p.category,
        p.unit_price,
        i.quantity,
        i.reorder_level,
        i.location
      FROM inventory i
      JOIN parts p ON p.id = i.part_id
      WHERE i.service_center_id = (
        SELECT id FROM service_centers WHERE manager_id = $1
      )
      ORDER BY p.name
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Inventory fetch error:", err);
    res.status(500).json({ message: "Failed to fetch inventory" });
  }
};  

export const getLowStockInventory = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        p.name,
        i.quantity,
        i.reorder_level
      FROM inventory i
      JOIN parts p ON p.id = i.part_id
      WHERE i.quantity <= i.reorder_level
      AND i.service_center_id = (
        SELECT id FROM service_centers WHERE manager_id = $1
      )
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch low stock" });
  }
};

export const addOrUpdatePart = async (req, res) => {
  const {
    part_id,
    part_code,
    name,
    category,
    unit_price,
    quantity,
    reorder_level,
    location,
  } = req.body;

  // quantity always required
if (quantity == null) {
  return res.status(400).json({ message: "Quantity is required" });
}
// new part validation
if (!part_id && (!name || !unit_price)) {
  return res.status(400).json({
    message: "Part name and unit price are required for new part",
  });
}


  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Get manager's service center
    const scRes = await client.query(
      `SELECT id FROM service_centers WHERE manager_id = $1`,
      [req.user.id]
    );

    if (!scRes.rows.length) {
      throw new Error("Service center not found");
    }

    const serviceCenterId = scRes.rows[0].id;
    let finalPartId = part_id;

    // 2️⃣ Create or update PART (GLOBAL)
    if (!part_id) {
      // 🔹 New part created by manager
      const partRes = await client.query(
        `
        INSERT INTO parts (part_code, name, category, unit_price)
        VALUES ($1,$2,$3,$4)
        RETURNING id
        `,
        [
          part_code || `P-${Date.now()}`,
          name,
          category || null,
          unit_price,
        ]
      );

      finalPartId = partRes.rows[0].id;
    } else {
      // 🔹 Update existing part price/details
      await client.query(
        `
        UPDATE parts
SET
  name = COALESCE($1, name),
  category = COALESCE($2, category),
  unit_price = COALESCE($3, unit_price)
WHERE id = $4

        `,
        [name, category, unit_price, part_id]
      );
    }

    // 3️⃣ UPSERT INVENTORY (SERVICE CENTER SPECIFIC)
    await client.query(
      `
      INSERT INTO inventory
        (service_center_id, part_id, quantity, reorder_level, location)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (service_center_id, part_id)
      DO UPDATE SET
        quantity = EXCLUDED.quantity,
        reorder_level = EXCLUDED.reorder_level,
        location = EXCLUDED.location,
        updated_at = NOW()
      `,
      [
        serviceCenterId,
        finalPartId,
        quantity,
        reorder_level || 0,
        location || null,
      ]
    );

    await client.query("COMMIT");

    res.json({
      message: "Part and inventory saved successfully",
      part_id: finalPartId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Add/Update part error:", err);
    res.status(500).json({ message: "Failed to save part" });
  } finally {
    client.release();
  }
};


export const getInventoryLogs = async (req, res) => {
  const result = await pool.query(
    `
    SELECT
      p.name,
      jp.quantity_used,
      jp.unit_price,
      jp.total_price,
      jc.id AS job_card_id,
      jp.created_at
    FROM job_parts jp
    JOIN parts p ON p.id = jp.part_id
    JOIN job_cards jc ON jc.id = jp.job_card_id
    WHERE jc.service_center_id = (
      SELECT id FROM service_centers WHERE manager_id=$1
    )
    ORDER BY jp.created_at DESC
    `,
    [req.user.id]
  );

  res.json(result.rows);
};

export const getAllParts = async (req, res) => {
  const result = await pool.query(
    `SELECT id, name, part_code FROM parts ORDER BY name`
  );
  res.json(result.rows);
};

// Add labor task to a job card
export const addJobTask = async (req, res) => {
  const jobCardId = req.params.id; // ✅ FIXED
  const { description, hours, labor_rate } = req.body;

  if (!description || !hours || !labor_rate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const total_cost = Number(hours) * Number(labor_rate);

    await pool.query(
      `
      INSERT INTO job_tasks
      (job_card_id, description, hours, labor_rate, total_cost)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [jobCardId, description, hours, labor_rate, total_cost]
    );

    await pool.query(
      `
      UPDATE job_cards
      SET total_labor_cost = COALESCE(total_labor_cost, 0) + $1,
          updated_at = NOW()
      WHERE id = $2
      `,
      [total_cost, jobCardId]
    );

    res.json({ message: "Task added successfully", total_cost });
  } catch (err) {
    console.error("Add job task error:", err);
    res.status(500).json({ message: "Failed to add task" });
  }
};

// Add part usage for a job card
export const addJobPart = async (req, res) => {
  const jobCardId = req.params.id;
  const { part_id, quantity } = req.body;

  if (!part_id || !quantity || quantity <= 0) {
    return res.status(400).json({
      message: "Part ID and valid quantity are required",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* 1️⃣ Get job card + service center */
    const jobRes = await client.query(
      `SELECT service_center_id
       FROM job_cards
       WHERE id = $1`,
      [jobCardId]
    );

    if (jobRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Job card not found" });
    }

    const serviceCenterId = jobRes.rows[0].service_center_id;

    /* 2️⃣ Check inventory */
    const invRes = await client.query(
      `
      SELECT i.quantity AS available_qty,
             p.unit_price
      FROM inventory i
      JOIN parts p ON p.id = i.part_id
      WHERE i.service_center_id = $1
        AND i.part_id = $2
      `,
      [serviceCenterId, part_id]
    );

    if (invRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Part not available in inventory" });
    }

    const { available_qty, unit_price } = invRes.rows[0];

    if (quantity > available_qty) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const totalPrice = Number(unit_price) * Number(quantity);

    /* 3️⃣ Insert into job_parts (✅ CORRECT COLUMN NAMES) */
    await client.query(
      `
      INSERT INTO job_parts
        (job_card_id, part_id, quantity_used, unit_price, total_price)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [jobCardId, part_id, quantity, unit_price, totalPrice]
    );

    /* 4️⃣ Deduct inventory */
    await client.query(
      `
      UPDATE inventory
      SET quantity = quantity - $1,
          updated_at = NOW()
      WHERE service_center_id = $2
        AND part_id = $3
      `,
      [quantity, serviceCenterId, part_id]
    );

    /* 5️⃣ Update job card parts total */
    await client.query(
      `
      UPDATE job_cards
      SET total_parts_cost = total_parts_cost + $1,
          updated_at = NOW()
      WHERE id = $2
      `,
      [totalPrice, jobCardId]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Part added successfully",
      total_price: totalPrice,
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Add job part error:", err);
    res.status(500).json({ message: "Failed to add job part" });
  } finally {
    client.release();
  }   
};


export const updateJobCardStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    const jobCardId = req.params.id;
    const { status } = req.body;

    await client.query("BEGIN");

    const jobRes = await client.query(
      `
      UPDATE job_cards
      SET status = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING booking_id
      `,
      [status, jobCardId]
    );

    if (!jobRes.rows.length) {
      throw new Error("Job card not found");
    }

    // 🔴 Sync booking ONLY when completed
    if (status === "completed") {
      await client.query(
        `
        UPDATE service_bookings
        SET status = 'completed',
            updated_at = NOW()
        WHERE id = $1
        `,
        [jobRes.rows[0].booking_id]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Job status updated" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Failed to update job status" });
  } finally {
    client.release();
  }
};


export const generateInvoice = async (req, res) => {
  try {
    const jobCardId = req.params.id;
    const { tax_percent = 0, discount_percent = 0 } = req.body;

    if (tax_percent < 0 || discount_percent < 0) {
      return res.status(400).json({
        message: "Tax and discount percentages must be non-negative",
      });
    }

    // 1️⃣ Get job totals
    const jobRes = await pool.query(
      `
      SELECT total_parts_cost, total_labor_cost
      FROM job_cards
      WHERE id = $1
      `,
      [jobCardId]
    );

    if (!jobRes.rows.length) {
      return res.status(404).json({ message: "Job card not found" });
    }

    const { total_parts_cost, total_labor_cost } = jobRes.rows[0];

    const subtotal =
      Number(total_parts_cost || 0) + Number(total_labor_cost || 0);

    // 2️⃣ Convert % → amount
    const tax = (subtotal * Number(tax_percent)) / 100;
    const discount = (subtotal * Number(discount_percent)) / 100;

    const total_amount = subtotal + tax - discount;

    if (total_amount < 0) {
      return res.status(400).json({
        message: "Total amount cannot be negative",
      });
    }

    const invoice_number = `INV-${Date.now()}`;

    // 3️⃣ Store AMOUNT (not %)
    await pool.query(
      `
      INSERT INTO invoices
      (job_card_id, invoice_number, parts_total, labor_total, tax, discount, total_amount, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,'unpaid')
      `,
      [
        jobCardId,
        invoice_number,
        total_parts_cost,
        total_labor_cost,
        tax.toFixed(2),
        discount.toFixed(2),
        total_amount.toFixed(2),
      ]
    );

    // 4️⃣ Update job card
   const updateRes = await pool.query(
  `
  UPDATE job_cards
  SET status = 'completed',
      updated_at = NOW()
  WHERE id = $1
  RETURNING booking_id, customer_id
  `,
  [jobCardId]
);

const { booking_id, customer_id } = updateRes.rows[0];

    // 5️⃣ Sync booking
await pool.query(
  `
  UPDATE service_bookings
  SET status = 'completed',
      updated_at = NOW()
  WHERE id = $1
  `,
  [booking_id]
);

// 6️⃣ 🔴 SOCKET UPDATE
io.to(`customer_${customer_id}`).emit("booking-status-updated", {
  bookingId: booking_id,
  status: "completed",
});

    res.json({
      invoice_number,
      subtotal,
      tax_percent,
      discount_percent,
      tax,
      discount,
      total_amount,
    });

  } catch (err) {
    console.error("Generate invoice error:", err);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
};
