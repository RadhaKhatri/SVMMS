import pool from "../db.js";

/**
 * CUSTOMER DASHBOARD STATS
 * GET /api/dashboard/stats
 */
export const getCustomerDashboardStats = async (req, res) => {
  try {
    const customerId = req.user.id;

    // 🚗 VEHICLES
    const vehicles = await pool.query(
      `SELECT COUNT(*) FROM vehicles WHERE owner_id = $1`,
      [customerId]
    );

    // 📅 ACTIVE BOOKINGS (pending + approved)
    const activeBookings = await pool.query(
      `SELECT COUNT(*) FROM service_bookings
        WHERE customer_id = $1
        AND status IN ('pending','approved')`,
      [customerId]
    );

    // ✅ COMPLETED SERVICES (invoice exists)
    const completedServices = await pool.query(
      `SELECT COUNT(DISTINCT sb.id)
        FROM service_bookings sb
        JOIN job_cards jc ON jc.booking_id = sb.id
        JOIN invoices i ON i.job_card_id = jc.id
        WHERE sb.customer_id = $1`,
      [customerId]
    );

    // ⏳ PENDING APPROVAL
    const pendingApproval = await pool.query(
      `SELECT COUNT(*) FROM service_bookings
        WHERE customer_id = $1
        AND status = 'pending'`,
      [customerId]
    );

    res.json([
      {
        key: "vehicles",
        title: "My Vehicles",
        value: Number(vehicles.rows[0].count),
        trend: "Registered vehicles",
      },
      {
        key: "active",
        title: "Active Bookings",
        value: Number(activeBookings.rows[0].count),
        trend: "In progress",
      },
      {
        key: "completed",
        title: "Completed Services",
        value: Number(completedServices.rows[0].count),
        trend: "Service history",
      },
      {
        key: "pending",
        title: "Pending Approval",
        value: Number(pendingApproval.rows[0].count),
        trend: "Awaiting approval",
      },
    ]);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * RECENT SERVICES
 * GET /api/dashboard/recent-services
 */
export const getRecentServices = async (req, res) => {
  try {
    const customerId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        sb.id AS booking_id,
        CONCAT(v.make,' ',v.model,' (',v.year,')') AS vehicle,
        STRING_AGG(DISTINCT s.name, ', ') AS services,
        sb.preferred_date,
        sb.status,
        COALESCE(i.total_amount, 0) AS total_amount
      FROM service_bookings sb
      JOIN vehicles v ON v.id = sb.vehicle_id
      LEFT JOIN new_booking_services nbs ON nbs.booking_id = sb.id
      LEFT JOIN services s ON s.id = nbs.service_id
      LEFT JOIN job_cards jc ON jc.booking_id = sb.id
      LEFT JOIN invoices i ON i.job_card_id = jc.id
      WHERE sb.customer_id = $1
      GROUP BY
        sb.id,
        v.make,
        v.model,
        v.year,
        sb.preferred_date,
        sb.status,
        i.total_amount
      ORDER BY sb.created_at DESC
      LIMIT 5
      `,
      [customerId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Recent services error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
