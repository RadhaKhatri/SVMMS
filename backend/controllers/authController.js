import bcrypt from "bcrypt";
import pool from "../db.js";

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, password, role } = req.body;


    // Check if email exists
    const emailCheck = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const name = `${firstName} ${lastName}`;

    await pool.query(
  `INSERT INTO users (name, email, password_hash, role, phone, address)
   VALUES ($1, $2, $3, $4, $5, $6)
   RETURNING id, name, email, role`,
  [`${firstName} ${lastName}`, email, hashedPassword, role, phone, address]
);


    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", err });
  }
};
