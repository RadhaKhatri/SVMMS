import pool from "../db.js";

export const getServiceCenters = async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, city FROM service_centers ORDER BY name"
  );
  res.json(result.rows);
};
