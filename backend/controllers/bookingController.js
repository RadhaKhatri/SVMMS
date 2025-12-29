import pool from "../db.js";
import { io } from "../server.js";

/* 1️⃣ CREATE BOOKING + MULTIPLE SERVICES */
export const createBooking = async (req, res) => {
  const {
    vehicle_id,
    service_center_id,
    preferred_date,
    preferred_time,
    remarks,
    services
  } = req.body;

  if (
    !vehicle_id ||
    !service_center_id ||
    !preferred_date ||
    !preferred_time ||
    !Array.isArray(services) ||
    services.length === 0
  ) {
    return res.status(400).json({ message: "All fields required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    /* 🔐 Validate vehicle ownership */
    const vehicleCheck = await client.query(
      `SELECT id FROM vehicles
       WHERE id = $1 AND owner_id = $2`,
      [vehicle_id, req.user.id]
    );

    if (vehicleCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(403).json({ message: "Unauthorized vehicle access" });
    }

    /* ✅ Validate services exist */
    const serviceCheck = await client.query(
      `SELECT id FROM services WHERE id = ANY($1::int[])`,
      [services]
    );

    if (serviceCheck.rows.length !== services.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Invalid service selected" });
    }

    /* ✅ Create booking */
    const bookingRes = await client.query(
      `
      INSERT INTO service_bookings
        (customer_id, vehicle_id, service_center_id,
         preferred_date, preferred_time, remarks, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING id
      `,
      [
        req.user.id,
        vehicle_id,
        service_center_id,
        preferred_date,
        preferred_time,
        remarks || null
      ]
    );

    const bookingId = bookingRes.rows[0].id;

    /* ✅ Attach services */
    for (const serviceId of services) {
      await client.query(
        `
        INSERT INTO new_booking_services (booking_id, service_id)
        VALUES ($1, $2)
        `,
        [bookingId, serviceId]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Booking created successfully",
      booking_id: bookingId
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Booking error:", err);
    res.status(500).json({ message: "Booking failed" });
  } finally {
    client.release();
  }
};

/* 

/* 2️⃣ GET USER BOOKINGS 
export const getMyBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT sb.*,
             v.make, v.model, v.year, v.vin,
             sc.name AS service_center,
             ARRAY_AGG(s.name) AS services
      FROM service_bookings sb
      JOIN vehicles v ON v.id = sb.vehicle_id
      JOIN service_centers sc ON sc.id = sb.service_center_id
      LEFT JOIN new_booking_services nbs ON nbs.booking_id = sb.id
      LEFT JOIN services s ON s.id = nbs.service_id
      WHERE sb.customer_id = $1
      GROUP BY sb.id, v.id, sc.id
      ORDER BY sb.created_at DESC
      `,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};
*/

export const getMyBookings = async (req, res) => {
  const { status } = req.query;

  try {
    let query = `
      SELECT sb.*,
             v.make, v.model, v.year, v.vin,
             sc.name AS service_center,
             ARRAY_AGG(s.name) AS services
      FROM service_bookings sb
      JOIN vehicles v ON v.id = sb.vehicle_id
      JOIN service_centers sc ON sc.id = sb.service_center_id
      LEFT JOIN new_booking_services nbs ON nbs.booking_id = sb.id
      LEFT JOIN services s ON s.id = nbs.service_id
      WHERE sb.customer_id = $1
    `;

    const values = [req.user.id];

    if (status) {
      query += ` AND sb.status = $2`;
      values.push(status);
    }

    query += `
      GROUP BY sb.id, v.id, sc.id
      ORDER BY sb.created_at DESC
    `;

    const result = await pool.query(query, values);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};


/* 3️⃣ CANCEL BOOKING */
export const cancelBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      UPDATE service_bookings
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1 AND customer_id = $2
      `,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cancel failed" });
  }
};

/* 4️⃣ GET SINGLE BOOKING DETAILS */
export const getBookingById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT sb.*,
             v.make, v.model, v.year, v.vin,
             sc.name AS service_center,
             ARRAY_AGG(s.name) AS services
      FROM service_bookings sb
      JOIN vehicles v ON v.id = sb.vehicle_id
      JOIN service_centers sc ON sc.id = sb.service_center_id
      LEFT JOIN new_booking_services nbs ON nbs.booking_id = sb.id
      LEFT JOIN services s ON s.id = nbs.service_id
      WHERE sb.id = $1 AND sb.customer_id = $2
      GROUP BY sb.id, v.id, sc.id
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch booking details" });
  }
};

/* 5️⃣ DELETE BOOKING (HARD DELETE) */
export const deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await pool.query(
      `SELECT status FROM service_bookings
       WHERE id = $1 AND customer_id = $2`,
      [id, req.user.id]
    );

    if (booking.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.rows[0].status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be deleted"
      });
    }

    await pool.query(
      `DELETE FROM service_bookings WHERE id = $1`,
      [id]
    );

    res.json({ message: "Booking deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }  
};

/* 6️⃣ UPDATE BOOKING STATUS */
export const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowed = ["approved", "completed", "cancelled"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    // 🔍 Get booking + customer_id
    const bookingRes = await pool.query(
      `SELECT customer_id FROM service_bookings WHERE id = $1`,
      [id]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const customerId = bookingRes.rows[0].customer_id;

    // ✅ Update status
    await pool.query(
      `
      UPDATE service_bookings 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      `,
      [status, id]
    );

    // 🔴 REAL-TIME EVENT (SAFE)
    io.to(`customer_${customerId}`).emit("booking-status-updated", {
      bookingId: id,
      status,
    });

    res.json({ message: "Booking status updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Status update failed" });
  }
};

export const completeJobCard = async (req, res) => {
  const { jobCardId } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1️⃣ Complete job card
    const jobRes = await client.query(
      `
      UPDATE job_cards
      SET status = 'completed',
          end_time = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING booking_id, customer_id
      `,
      [jobCardId]
    );

    if (!jobRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Job card not found" });
    }

    const { booking_id, customer_id } = jobRes.rows[0];

    // 2️⃣ Update booking
    await client.query(
      `
      UPDATE service_bookings
      SET status = 'completed',
          updated_at = NOW()
      WHERE id = $1
      `,
      [booking_id]
    );

    // 3️⃣ 🔴 REAL-TIME EVENT TO CUSTOMER
    io.to(`customer_${customer_id}`).emit("booking-status-updated", {
      bookingId: booking_id,
      status: "completed",
    });

    await client.query("COMMIT");

    res.json({ message: "Job completed & customer notified" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Completion failed" });
  } finally {
    client.release();
  }
};


export const completeJobTask = async (req, res) => {
  const { taskId } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1️⃣ Mark task completed
    const taskRes = await client.query(
      `
      UPDATE job_tasks
      SET completed = true
      WHERE id = $1
      RETURNING job_card_id
      `,
      [taskId]
    );

    if (!taskRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Task not found" });
    }

    const jobCardId = taskRes.rows[0].job_card_id;

    // 2️⃣ Get task progress
    const progressRes = await client.query(
      `
      SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE completed = true) AS completed
      FROM job_tasks
      WHERE job_card_id = $1
      `,
      [jobCardId]
    );

    const { total, completed } = progressRes.rows[0];

    // 3️⃣ Get customer + booking
    const jobRes = await client.query(
      `
      SELECT booking_id, customer_id
      FROM job_cards
      WHERE id = $1
      `,
      [jobCardId]
    );

    const { booking_id, customer_id } = jobRes.rows[0];

    // 4️⃣ Emit REAL-TIME progress
    io.to(`customer_${customer_id}`).emit("task-progress-updated", {
      bookingId: booking_id,
      jobCardId,
      completed: Number(completed),
      total: Number(total),
    });

    // 5️⃣ AUTO COMPLETE JOB + BOOKING
if (Number(completed) === Number(total) && Number(total) > 0) {

  // Complete job card
  await client.query(
    `
    UPDATE job_cards
    SET status = 'completed',
        end_time = NOW(),
        updated_at = NOW()
    WHERE id = $1
    `,
    [jobCardId]
  );

  // Complete booking
  await client.query(
    `
    UPDATE service_bookings
    SET status = 'completed',
        updated_at = NOW()
    WHERE id = $1
    `,
    [booking_id]
  );

  // 🔴 Notify customer booking completed
  io.to(`customer_${customer_id}`).emit("booking-status-updated", {
    bookingId: booking_id,
    status: "completed",
  });
}

    await client.query("COMMIT");

    res.json({ message: "Task completed", completed, total });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Task update failed" });
  } finally {
    client.release();
  }
};

export const getTaskProgressByBooking = async (req, res) => {
  const { bookingId } = req.params;

  const result = await pool.query(
    `
    SELECT 
      COUNT(jt.*) AS total,
      COUNT(jt.*) FILTER (WHERE jt.completed = true) AS completed
    FROM job_cards jc
    JOIN job_tasks jt ON jt.job_card_id = jc.id
    WHERE jc.booking_id = $1
    `,
    [bookingId]
  );

  res.json(result.rows[0]);
};

export const getJobProgressByBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT 
        jc.id AS job_card_id,
        jc.status AS job_status,
        jc.start_time,
        jt.id AS task_id,
        jt.description AS service_name,
        jt.status
      FROM job_cards jc
      LEFT JOIN job_tasks jt ON jt.job_card_id = jc.id
      WHERE jc.booking_id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ jobStarted: false });
    }

    const tasks = result.rows
      .filter(r => r.task_id)
      .map(r => ({
        id: r.task_id,
        service_name: r.service_name,
        status: r.status
      }));

    const completed = tasks.filter(t => t.status === "completed").length;

    res.json({
      jobStarted: true,
      jobCardId: result.rows[0].job_card_id,
      jobStatus: result.rows[0].job_status,
      startTime: result.rows[0].start_time,
      summary: {
        completed,
        total: tasks.length
      },
      tasks
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load job progress" });
  }
};
