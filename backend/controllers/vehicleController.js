import pool from "../db.js";

/* GET all vehicles for logged-in user */
export const getVehicles = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM vehicles WHERE owner_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET vehicle by ID */
export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM vehicles WHERE id = $1 AND owner_id = $2",
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Vehicle not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ADD new vehicle */
export const addVehicle = async (req, res) => {
  try {
    const { vin, make, model, year, engine_type, mileage } = req.body;
    const result = await pool.query(
      `INSERT INTO vehicles (owner_id, vin, make, model, year, engine_type, mileage)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.id, vin, make, model, year, engine_type, mileage]
    );
    res.status(201).json({ message: "Vehicle added successfully", vehicle: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* UPDATE vehicle */
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { vin, make, model, year, engine_type, mileage } = req.body;

    const result = await pool.query(
      `UPDATE vehicles SET vin=$1, make=$2, model=$3, year=$4, engine_type=$5, mileage=$6, updated_at=NOW()
       WHERE id=$7 AND owner_id=$8 RETURNING *`,
      [vin, make, model, year, engine_type, mileage, id, req.user.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle updated successfully", vehicle: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* DELETE vehicle */
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM vehicles WHERE id=$1 AND owner_id=$2 RETURNING *",
      [id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Vehicle not found" });
    res.json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET services for a specific vehicle */
export const getVehicleServices = async (req, res) => {
  try {
    const { id } = req.params; // vehicle id

    const result = await pool.query(
      `SELECT jc.id AS job_card_id, sb.service_type, jc.status, jc.start_time, jc.end_time
       FROM job_cards jc
       JOIN service_bookings sb ON jc.booking_id = sb.id
       WHERE jc.vehicle_id=$1 AND jc.customer_id=$2
       ORDER BY jc.created_at DESC`,
      [id, req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyVehicles = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM vehicles WHERE owner_id = $1",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch vehicles" });
  }
};
