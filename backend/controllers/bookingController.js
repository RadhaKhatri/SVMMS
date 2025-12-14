import pool from "../db.js";

/* 1️⃣ Create Booking */
export const createBooking = async (req, res) => {
  const {
    vehicle_id,
    service_center_id,
    service_type,
    preferred_date,
    preferred_time,
    remarks
  } = req.body;

  if (!vehicle_id || !service_type || !preferred_date || !preferred_time) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  const result = await pool.query(
    `INSERT INTO service_bookings
     (customer_id, vehicle_id, service_center_id, service_type,
      preferred_date, preferred_time, status, remarks)
     VALUES ($1,$2,$3,$4,$5,$6,'pending',$7)
     RETURNING *`,
    [
      req.user.id,
      vehicle_id,
      service_center_id,
      service_type,
      preferred_date,
      preferred_time,
      remarks
    ]
  );

  res.status(201).json({
    message: "Booking request submitted",
    booking: result.rows[0]
  });
};

/* 2️⃣ Get Customer Bookings */
export const getMyBookings = async (req, res) => {
  const result = await pool.query(
    `SELECT sb.*,
            v.make, v.model, v.year, v.vin
     FROM service_bookings sb
     JOIN vehicles v ON v.id = sb.vehicle_id
     WHERE sb.customer_id = $1
     ORDER BY sb.created_at DESC`,
    [req.user.id]
  );

  res.json(result.rows);
};

/* 3️⃣ Cancel Booking */
export const cancelBooking = async (req, res) => {
  const { id } = req.params;

  await pool.query(
    `UPDATE service_bookings
     SET status='cancelled', updated_at=NOW()
     WHERE id=$1 AND customer_id=$2`,
    [id, req.user.id]
  );

  res.json({ message: "Booking cancelled" });
};
