import pool from "../db.js";

/**
 * CUSTOMER DASHBOARD STATS
 * GET /api/dashboard/stats
 */
export const getCustomerDashboardStats = async (req, res) => {
  try {
    const customerId = req.user.id;

    const vehicles = await pool.query(
      "SELECT COUNT(*) FROM vehicles WHERE owner_id = $1",
      [customerId]
    );

    const activeBookings = await pool.query(
      `SELECT COUNT(*) FROM job_cards
       WHERE customer_id = $1
       AND status IN ('open','in_progress')`,
      [customerId]
    );

    const completedServices = await pool.query(
      `SELECT COUNT(*) FROM job_cards
       WHERE customer_id = $1
       AND status IN ('completed','delivered')`,
      [customerId]
    );

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
      `SELECT
         jc.id,
         CONCAT(v.make, ' ', v.model, ' - ', v.vin) AS vehicle,
         sb.service_type AS service,
         jc.created_at::date AS date,
         jc.status,
         jc.total_amount AS amount
       FROM job_cards jc
       JOIN vehicles v ON jc.vehicle_id = v.id
       JOIN service_bookings sb ON jc.booking_id = sb.id
       WHERE jc.customer_id = $1
       ORDER BY jc.created_at DESC
       LIMIT 5`,
      [customerId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Recent services error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
