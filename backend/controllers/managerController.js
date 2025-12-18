import pool from "../db.js";

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
        mp.availability_status
      FROM service_center_mechanics scm
      JOIN users u ON u.id = scm.mechanic_id
      LEFT JOIN mechanic_profiles mp ON mp.user_id = u.id
      WHERE scm.service_center_id = (
        SELECT id FROM service_centers WHERE manager_id = $1
      )
      AND scm.status = 'approved'
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
  sb.service_type,

  v.make || ' ' || v.model AS vehicle,

  COALESCE(cu.first_name || ' ' || cu.last_name, cu.name) AS customer_name,

  COALESCE(me.first_name || ' ' || me.last_name, me.name) AS mechanic_name

FROM job_cards jc
JOIN service_centers sc ON sc.id = jc.service_center_id
JOIN service_bookings sb ON sb.id = jc.booking_id
JOIN vehicles v ON v.id = jc.vehicle_id
JOIN users cu ON cu.id = jc.customer_id
LEFT JOIN users me ON me.id = jc.assigned_mechanic
WHERE sc.manager_id = $1
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
