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

export const loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  console.log("🔥 Login request received:");
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("Selected Role:", role);

  try {
    console.log("🔍 Checking if email exists...");
    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    console.log("📌 Query Response:", userResult.rows);

    if (userResult.rows.length === 0) {
      console.log("❌ Email not found");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = userResult.rows[0];
    console.log("✅ User found in DB:", user);

    console.log("🔍 Checking role match...");
    console.log("User Role:", user.role, " | Selected Role:", role);

    if (user.role !== role) {
      console.log("❌ Role mismatch");
      return res.status(400).json({ message: "Selected role is incorrect" });
    }

    console.log("🔍 Validating password...");
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    console.log("Password Match:", passwordMatch);

    if (!passwordMatch) {
      console.log("❌ Incorrect password");
      return res.status(400).json({ message: "Invalid email or password" });
    }

    console.log("🔐 Creating JWT Token...");
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Login successful, token generated");

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
    return res.status(500).json({ message: "Server error", err });
  }
};
