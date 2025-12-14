import bcrypt from "bcrypt";
import pool from "../db.js";
import jwt from 'jsonwebtoken';

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

// ========================================
// LOGIN USER (NEW)
// ========================================

const ROLE_MAP = {
  customer: "customer",
  mechanic: "mechanic",
  manager: "service_center_manager",
  admin: "admin",
};

export const loginUser = async (req, res) => {
  
    const { email, password, role } = req.body;

  console.log("🔥 Login request received:");
  console.log("Email:", email);
  console.log("Selected Role (UI):", role);

  try {
    // 1️⃣ Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    console.log("✅ User found:", user.email, "| DB Role:", user.role);

    // 2️⃣ Map UI role → DB role
    const mappedRole = ROLE_MAP[role];

    if (!mappedRole) {
      return res.status(400).json({ message: "Invalid role selected" });
    }

    console.log("🔍 Role Check:", user.role, "vs", mappedRole);

    if (user.role !== mappedRole) {
      return res.status(400).json({ message: "Selected role is incorrect" });
    }

    // 3️⃣ Password check
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 4️⃣ Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });

  } catch (err) {
    console.error("🔥 SERVER ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
  