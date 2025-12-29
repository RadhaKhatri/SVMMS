import pool from "../db.js";

/* Get all reusable services */
export const getServices = async (req, res) => {
  const result = await pool.query(
    "SELECT id, name FROM services ORDER BY name"
  );
  res.json(result.rows);
};

/* Add new service (stored forever) */
export const createService = async (req, res) => {
  const { name } = req.body;

  if (!name)
    return res.status(400).json({ message: "Service name required" });

  const result = await pool.query(
    `INSERT INTO services (name)
     VALUES ($1)
     ON CONFLICT (name) DO NOTHING
     RETURNING *`,
    [name]
  );

  // If already exists
  if (result.rows.length === 0) {
    const existing = await pool.query(
      "SELECT * FROM services WHERE name=$1",
      [name]
    );
    return res.json(existing.rows[0]);
  }

  res.status(201).json(result.rows[0]);
};
