import pool from "../db.js";

/**
 * GET mechanic profile (view-only)
 */
export const getMechanicProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query(
      `SELECT id, name, email, phone, address
       FROM users
       WHERE id = $1 AND role = 'mechanic'`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "Mechanic not found" });
    }

    const profileResult = await pool.query(
      `SELECT hourly_rate, certifications, availability_status, notes
       FROM mechanic_profiles
       WHERE user_id = $1`,
      [userId]
    );

    res.json({
      ...userResult.rows[0],
      ...(profileResult.rows[0] || {}),
    });
  } catch (error) {
    console.error("Get Mechanic Profile Error:", error);
    res.status(500).json({ message: "Failed to load profile" });
  }
};

/**
 * UPDATE mechanic profile
 */
export const updateMechanicProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      phone,
      address,
      hourly_rate,
      certifications,
      availability_status,
      notes,
    } = req.body;

    await pool.query(
      `UPDATE users
       SET phone = $1, address = $2, updated_at = NOW()
       WHERE id = $3`,
      [phone, address, userId]
    );

    await pool.query(
      `INSERT INTO mechanic_profiles
       (user_id, hourly_rate, certifications, availability_status, notes)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET
         hourly_rate = EXCLUDED.hourly_rate,
         certifications = EXCLUDED.certifications,
         availability_status = EXCLUDED.availability_status,
         notes = EXCLUDED.notes,
         updated_at = NOW()`,
      [userId, hourly_rate, certifications, availability_status, notes]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update Mechanic Profile Error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const getServiceCenters = async (req, res) => {
  const mechanicId = req.user.id;

  const result = await pool.query(
    `SELECT sc.id, sc.name, sc.city, scm.status
     FROM service_centers sc
     LEFT JOIN service_center_mechanics scm
       ON scm.service_center_id = sc.id
      AND scm.mechanic_id = $1
     ORDER BY sc.name`,
    [mechanicId]
  );

  res.json(result.rows);
};

/**
 * Request a service center
 */
export const requestServiceCenter = async (req, res) => {
  try {
    const mechanicId = req.user.id;
    const serviceCenterId = req.params.id;

    await pool.query(
      `INSERT INTO service_center_mechanics
       (service_center_id, mechanic_id, status)
       VALUES ($1, $2, 'pending')
       ON CONFLICT (service_center_id, mechanic_id)
       DO NOTHING`,
      [serviceCenterId, mechanicId]
    );

    res.json({ message: "Request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Request failed" });
  }
};

/**
 * View my request status
 */
export const getMyServiceCenterRequests = async (req, res) => {
  const mechanicId = req.user.id;

  const result = await pool.query(
    `SELECT sc.name, sc.city, scm.status
     FROM service_center_mechanics scm
     JOIN service_centers sc ON sc.id = scm.service_center_id
     WHERE scm.mechanic_id = $1`,
    [mechanicId]
  );

  res.json(result.rows);
};

/* ===============================
   GET ASSIGNED JOB CARDS
================================ */
export const getMyJobCards = async (req, res) => {
  try {
    if (req.user.role !== "mechanic") {
      return res.status(403).json({ message: "Access denied" });
    }

    const mechanicId = req.user.id;

    const result = await pool.query(
      `SELECT
        jc.id AS job_card_id,
        jc.status,
        jc.created_at,
        sb.service_type,
        v.make || ' ' || v.model AS vehicle,
        COALESCE(cu.first_name || ' ' || cu.last_name, cu.name) AS customer_name
       FROM job_cards jc
       JOIN service_bookings sb ON sb.id = jc.booking_id
       JOIN vehicles v ON v.id = jc.vehicle_id
       JOIN users cu ON cu.id = jc.customer_id
       WHERE jc.assigned_mechanic = $1
       ORDER BY jc.created_at DESC`,
      [mechanicId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Get mechanic job cards error:", err);
    res.status(500).json({ message: "Failed to load job cards" });
  }
};

export const getMyJobCardDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const mechanicId = req.user.id;

    // 1️⃣ Job card main info
    const result = await pool.query(
      `SELECT
        jc.id, jc.status, jc.start_time, jc.end_time,
        jc.notes, jc.total_labor_cost, jc.total_parts_cost,
        sb.service_type, sb.preferred_date, sb.preferred_time,
        v.make, v.model, v.year, v.engine_type, v.vin, v.mileage,
        COALESCE(cu.first_name || ' ' || cu.last_name, cu.name) AS customer_name,
        cu.phone, cu.email
       FROM job_cards jc
       JOIN service_bookings sb ON sb.id = jc.booking_id
       JOIN vehicles v ON v.id = jc.vehicle_id
       JOIN users cu ON cu.id = jc.customer_id
       WHERE jc.id = $1 AND jc.assigned_mechanic = $2`,
      [id, mechanicId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Job card not found" });
    }

    const r = result.rows[0];

    // 2️⃣ Tasks
    const tasks = await pool.query(
      `SELECT id, description, hours, labor_rate, completed
       FROM job_tasks
       WHERE job_card_id = $1
       ORDER BY id`,
      [id]
    );

    // 3️⃣ Parts
    const parts = await pool.query(
      `SELECT jp.id,
              p.name,
              jp.quantity_used AS quantity,
              jp.unit_price,
              jp.total_price
       FROM job_parts jp
       JOIN parts p ON p.id = jp.part_id
       WHERE jp.job_card_id = $1`,
      [id]
    );

    // 4️⃣ Final response
    res.json({
      id: r.id,
      status: r.status,
      service_type: r.service_type,
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
      tasks: tasks.rows, // ✅ FIX
      parts: parts.rows, // ✅ FIX
      notes: r.notes,
    });
  } catch (err) {
    console.error("Job card detail error:", err);
    res.status(500).json({ message: "Failed to load job card" });
  }
};

export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ✅ Validate allowed statuses
    const allowed = [
      "open",
      "in_progress",
      "ready_for_completion",
      "completed",
    ];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // ✅ Authorization check
    const job = await pool.query(
      `SELECT assigned_mechanic FROM job_cards WHERE id = $1`,
      [id]
    );

    if (!job.rows.length) {
      return res.status(404).json({ message: "Job card not found" });
    }

    if (job.rows[0].assigned_mechanic !== req.user.id) {
      return res.status(403).json({ message: "Not your job card" });
    }

    // ✅ SIMPLE update (NO CASE)
    await pool.query(
      `
      UPDATE job_cards
      SET status = $1,
          updated_at = NOW()
      WHERE id = $2
      `,
      [status, id]
    );

    // ✅ Handle timeline separately
    if (status === "in_progress") {
      await pool.query(
        `UPDATE job_cards SET start_time = NOW() WHERE id = $1 AND start_time IS NULL`,
        [id]
      );
    }

    if (status === "completed") {
      await pool.query(`UPDATE job_cards SET end_time = NOW() WHERE id = $1`, [
        id,
      ]);
    }

    res.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("updateJobStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const addJobTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, hours, labor_rate } = req.body;

    const total_cost = hours * labor_rate;

    await pool.query(
      `INSERT INTO job_tasks
       (job_card_id, description, hours, labor_rate, total_cost)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, description, hours, labor_rate, total_cost]
    );

    await pool.query(
      `UPDATE job_cards
       SET total_labor_cost = (
         SELECT COALESCE(SUM(total_cost), 0)
         FROM job_tasks
         WHERE job_card_id = $1
       )
       WHERE id = $1`,
      [id]
    );

    res.json({ message: "Task added" });
  } catch (err) {
    console.error("addJobTask error:", err);
    res.status(500).json({ message: "Failed to add task" });
  }
};

export const addJobPart = async (req, res) => {
  const { id } = req.params; // job_card_id
  const { part_id, quantity } = req.body;

  try {
    // 1️⃣ Get job card + service center
    const jobRes = await pool.query(
      `SELECT service_center_id
       FROM job_cards
       WHERE id = $1`,
      [id]
    );

    if (jobRes.rows.length === 0) {
      return res.status(404).json({ message: "Job card not found" });
    }

    const serviceCenterId = jobRes.rows[0].service_center_id;

    // 2️⃣ Check inventory
    const inventoryRes = await pool.query(
      `
      SELECT quantity
      FROM inventory
      WHERE part_id = $1
        AND service_center_id = $2
      `,
      [part_id, serviceCenterId]
    );

    if (inventoryRes.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Part not available in inventory" });
    }

    const availableQty = inventoryRes.rows[0].quantity;

    if (availableQty < quantity) {
      return res.status(400).json({ message: "Insufficient inventory stock" });
    }

    // 3️⃣ Insert into job_parts
    await pool.query(
      `
      INSERT INTO job_parts (job_card_id, part_id, quantity_used, unit_price, total_price)
      SELECT $1, p.id, $2, p.unit_price, p.unit_price * $2
      FROM parts p
      WHERE p.id = $3
      `,
      [id, quantity, part_id]
    );

    // 4️⃣ Reduce inventory
    await pool.query(
      `
      UPDATE inventory
      SET quantity = quantity - $1,
          updated_at = NOW()
      WHERE part_id = $2
        AND service_center_id = $3
      `,
      [quantity, part_id, serviceCenterId]
    );

    // 5️⃣ Update job_cards total_parts_cost
    await pool.query(
      `
      UPDATE job_cards
      SET total_parts_cost = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM job_parts
        WHERE job_card_id = $1
      ),
      updated_at = NOW()
      WHERE id = $1
      `,
      [id]
    );

    res.json({ message: "Part added successfully" });
  } catch (err) {
    console.error("addJobPart error:", err);
    res.status(500).json({ message: "Failed to add part" });
  }
};

export const saveJobNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    await pool.query(
      `UPDATE job_cards
       SET notes = $1, updated_at = NOW()
       WHERE id = $2 AND assigned_mechanic = $3`,
      [notes, id, req.user.id]
    );

    res.json({ message: "Notes saved successfully" });
  } catch (err) {
    console.error("saveJobNotes error:", err);
    res.status(500).json({ message: "Failed to save notes" });
  }
};

export const generateInvoice = async (req, res) => {
  const { jobCardId } = req.params;

  const jc = await pool.query(
    `SELECT total_labor_cost, total_parts_cost
     FROM job_cards WHERE id = $1`,
    [jobCardId]
  );

  const labor = jc.rows[0].total_labor_cost;
  const parts = jc.rows[0].total_parts_cost;
  const tax = (labor + parts) * 0.18;
  const total = labor + parts + tax;

  await pool.query(
    `INSERT INTO invoices
     (job_card_id, invoice_number, labor_total, parts_total, tax, total_amount, status)
     VALUES ($1, 'INV-' || EXTRACT(EPOCH FROM NOW()), $2, $3, $4, $5, 'unpaid')`,
    [jobCardId, labor, parts, tax, total]
  );

  res.json({ message: "Invoice generated" });
};

export const getAvailableParts = async (req, res) => {
  const { jobCardId } = req.params;

  const jobRes = await pool.query(
    `SELECT service_center_id FROM job_cards WHERE id = $1`,
    [jobCardId]
  );

  if (jobRes.rows.length === 0) {
    return res.status(404).json({ message: "Job card not found" });
  }

  const serviceCenterId = jobRes.rows[0].service_center_id;

  const partsRes = await pool.query(
    `SELECT p.id, p.name, p.unit_price, i.quantity
     FROM inventory i
     JOIN parts p ON p.id = i.part_id
     WHERE i.service_center_id = $1 AND i.quantity > 0`,
    [serviceCenterId]
  );

  res.json(partsRes.rows);
};

export const completeJobTask = async (req, res) => {
  try {
    const { jobCardId, taskId } = req.params;

    // 1️⃣ Mark task completed
    await pool.query(
      `
      UPDATE job_tasks
      SET completed = TRUE
      WHERE id = $1 AND job_card_id = $2
      `,
      [taskId, jobCardId]
    );

    // 2️⃣ Check if ALL tasks are completed
    const check = await pool.query(
      `
      SELECT 
        COUNT(*) FILTER (WHERE completed = FALSE) AS pending
      FROM job_tasks
      WHERE job_card_id = $1
      `,
      [jobCardId]
    );

    const pendingTasks = Number(check.rows[0].pending);

    // 3️⃣ If no pending tasks → mark job ready
    if (pendingTasks === 0) {
      await pool.query(
        `
        UPDATE job_cards
        SET status = 'ready_for_completion'
        WHERE id = $1
        `,
        [jobCardId]
      );
    }

    res.json({
      message: "Task completed",
      allTasksCompleted: pendingTasks === 0,
    });
  } catch (err) {
    console.error("completeJobTask error:", err);
    res.status(500).json({ message: "Failed to complete task" });
  }
};

export const getMechanicSchedule = async (req, res) => {
  try {
    const mechanicId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        jc.id AS job_card_id,
        sb.preferred_date,
        sb.preferred_time,
        sb.service_type,
        jc.status,
        CONCAT(v.make, ' ', v.model, ' (', v.year, ')') AS vehicle,
        u.name AS customer_name
      FROM job_cards jc
      JOIN service_bookings sb ON sb.id = jc.booking_id
      JOIN vehicles v ON v.id = jc.vehicle_id
      JOIN users u ON u.id = jc.customer_id
      WHERE jc.assigned_mechanic = $1
        AND jc.status IN ('open', 'in_progress')
      ORDER BY sb.preferred_date, sb.preferred_time
      `,
      [mechanicId]
    );

    res.json({
      schedule: result.rows,
    });
  } catch (err) {
    console.error("getMechanicSchedule error:", err);
    res.status(500).json({ message: "Failed to load schedule" });
  }
};
