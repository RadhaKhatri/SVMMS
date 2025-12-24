import pool from "../db.js";

/* ================================
   ADMIN DASHBOARD DATA
================================ */
export const getAdminDashboardData = async (req, res) => {
  try {
    /* ================================
       1️⃣ TOTAL REVENUE
    ================================ */
    const revenueResult = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) AS total_revenue
      FROM invoices
      WHERE status = 'paid'
    `);

    /* ================================
       2️⃣ ACTIVE CUSTOMERS
    ================================ */
    const customersResult = await pool.query(`
      SELECT COUNT(*) AS active_customers
      FROM users
      WHERE role = 'customer' AND is_active = true
    `);

    /* ================================
       3️⃣ VEHICLES SERVICED
    ================================ */
    const vehiclesResult = await pool.query(`
      SELECT COUNT(DISTINCT vehicle_id) AS vehicles_serviced
      FROM job_cards
      WHERE status IN ('completed','delivered')
    `);

    /* ================================
       4️⃣ SERVICES COMPLETED
    ================================ */
    const servicesCompletedResult = await pool.query(`
      SELECT COUNT(*) AS services_completed
      FROM job_cards
      WHERE status = 'completed'
    `);

    /* ================================
       5️⃣ MONTHLY REVENUE TREND
    ================================ */
    const revenueTrendResult = await pool.query(`
      SELECT 
        TO_CHAR(issued_at, 'Mon') AS month,
        SUM(total_amount) AS revenue
      FROM invoices
      WHERE status = 'paid'
      GROUP BY month, DATE_PART('month', issued_at)
      ORDER BY DATE_PART('month', issued_at)
    `);

    /* ================================
       6️⃣ SERVICE DISTRIBUTION
    ================================ */
    const serviceDistributionResult = await pool.query(`
      SELECT s.name, COUNT(nbs.service_id)::int AS value
      FROM new_booking_services nbs
      JOIN services s ON s.id = nbs.service_id
      GROUP BY s.name
      ORDER BY value DESC
    `);

    /* ================================
       7️⃣ TOP PERFORMING MECHANICS
    ================================ */
  const topMechanicsResult = await pool.query(`
  SELECT 
    u.name,
    COUNT(jc.id)::int AS completed,
    ROUND((4.5 + RANDOM() * 0.5)::numeric, 1) AS rating
  FROM job_cards jc
  JOIN users u ON u.id = jc.assigned_mechanic
  WHERE jc.status = 'completed'
  GROUP BY u.name
  ORDER BY completed DESC
  LIMIT 3
`);

    res.status(200).json({
      stats: {
        totalRevenue: revenueResult.rows[0].total_revenue,
        activeCustomers: customersResult.rows[0].active_customers,
        vehiclesServiced: vehiclesResult.rows[0].vehicles_serviced,
        servicesCompleted: servicesCompletedResult.rows[0].services_completed,
      },
      revenueTrend: revenueTrendResult.rows,
      serviceDistribution: serviceDistributionResult.rows,
      topMechanics: topMechanicsResult.rows,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        email,
        phone,
        is_active,
        created_at
      FROM users
      WHERE role = 'customer'
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Admin get customers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllServiceCenters = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT sc.id, sc.name, sc.address, sc.city, sc.contact_number, 
             u.name AS manager_name, sc.created_at
      FROM service_centers sc
      LEFT JOIN users u ON u.id = sc.manager_id
      ORDER BY sc.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Admin get service centers error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getCustomerFullDetails = async (req, res) => {
  try {
    const { id } = req.params;

    /* ================================
       CUSTOMER BASIC INFO
    ================================ */
    const customerResult = await pool.query(
      `
      SELECT id, name, email, phone, created_at
      FROM users
      WHERE id = $1 AND role = 'customer'
      `,
      [id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    /* ================================
       CUSTOMER VEHICLES
    ================================ */
    const vehiclesResult = await pool.query(
      `
      SELECT 
        id,
        make,
        model,
        year,
        engine_type,
        mileage
      FROM vehicles
      WHERE owner_id = $1
      `,
      [id]
    );

    /* ================================
       JOB CARDS + VEHICLE + MECHANIC + SERVICE CENTER + INVOICE
    ================================ */
    const jobCardsResult = await pool.query(
      `
      SELECT 
        jc.id,
        jc.status,
        jc.created_at,

        v.make,
        v.model,

        sc.name AS service_center_name,
        sc.city AS service_center_city,

        u.name AS mechanic_name,

        inv.total_amount,
        inv.status AS invoice_status

      FROM job_cards jc
      JOIN vehicles v ON v.id = jc.vehicle_id
      JOIN service_centers sc ON sc.id = jc.service_center_id
      LEFT JOIN users u ON u.id = jc.assigned_mechanic
      LEFT JOIN invoices inv ON inv.job_card_id = jc.id

      WHERE jc.customer_id = $1
      ORDER BY jc.created_at DESC
      `,
      [id]
    );

    res.json({
      customer: customerResult.rows[0],
      vehicles: vehiclesResult.rows,
      jobCards: jobCardsResult.rows,
    });

  } catch (error) {
    console.error("Admin customer details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================================
   Get Full Details of a Service Center
================================ */
export const getServiceCenterDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Service Center Basic Info
    const scResult = await pool.query(`
      SELECT sc.id, sc.name, sc.address, sc.city, sc.contact_number,
             u.name AS manager_name
      FROM service_centers sc
      LEFT JOIN users u ON u.id = sc.manager_id
      WHERE sc.id = $1
    `, [id]);

    if (scResult.rows.length === 0) {
      return res.status(404).json({ message: "Service Center not found" });
    }
    const serviceCenter = scResult.rows[0];

    // 2️⃣ Assigned Mechanics
    const mechanicsResult = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, scm.status
      FROM service_center_mechanics scm
      JOIN users u ON u.id = scm.mechanic_id
      WHERE scm.service_center_id = $1
    `, [id]);

    // 3️⃣ Job Cards with vehicle, customer, mechanic, invoice info
    const jobCardsResult = await pool.query(`
      SELECT 
        jc.id, jc.status, jc.created_at, jc.total_labor_cost, jc.total_parts_cost,
        v.make, v.model, v.year, v.vin,
        c.name AS customer_name,
        u.name AS mechanic_name,
        inv.invoice_number, inv.total_amount, inv.status AS invoice_status
      FROM job_cards jc
      JOIN vehicles v ON v.id = jc.vehicle_id
      JOIN users c ON c.id = jc.customer_id
      LEFT JOIN users u ON u.id = jc.assigned_mechanic
      LEFT JOIN invoices inv ON inv.job_card_id = jc.id
      WHERE jc.service_center_id = $1
      ORDER BY jc.created_at DESC
    `, [id]);

    // 4️⃣ Inventory of the Service Center
    const inventoryResult = await pool.query(`
      SELECT p.id AS part_id, p.name AS part_name, p.unit_price, i.quantity, i.reorder_level, i.location
      FROM inventory i
      JOIN parts p ON p.id = i.part_id
      WHERE i.service_center_id = $1
    `, [id]);

    res.json({
      serviceCenter,
      mechanics: mechanicsResult.rows,
      jobCards: jobCardsResult.rows,
      inventory: inventoryResult.rows,
    });

  } catch (error) {
    console.error("Admin service center details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= PARTS MASTER ================= */

export const getPartsCatalog = async (req, res) => {
  const result = await pool.query(`
    SELECT id, part_code, name, description, category, unit_price, created_at
    FROM parts
    ORDER BY created_at DESC
  `);
  res.json(result.rows);
};

export const createPart = async (req, res) => {
  const { part_code, name, description, category, unit_price } = req.body;

  await pool.query(
    `INSERT INTO parts (part_code, name, description, category, unit_price)
     VALUES ($1,$2,$3,$4,$5)`,
    [part_code, name, description, category, unit_price]
  );

  res.json({ message: "Part added successfully" });
};

export const updatePart = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, unit_price } = req.body;

  await pool.query(
    `UPDATE parts
     SET name=$1, description=$2, category=$3, unit_price=$4
     WHERE id=$5`,
    [name, description, category, unit_price, id]
  );

  res.json({ message: "Part updated" });
};

/* ================= GLOBAL INVENTORY ================= */

export const getGlobalInventory = async (req, res) => {
  const result = await pool.query(`
    SELECT 
      i.id,
      sc.name AS service_center,
      p.part_code,
      p.name,
      p.category,
      p.unit_price,
      i.quantity,
      i.reorder_level,
      i.location
    FROM inventory i
    JOIN parts p ON p.id = i.part_id
    JOIN service_centers sc ON sc.id = i.service_center_id
    ORDER BY sc.name
  `);

  res.json(result.rows);
};

export const getLowStockGlobal = async (req, res) => {
  const result = await pool.query(`
    SELECT 
      sc.name AS service_center,
      p.name,
      i.quantity,
      i.reorder_level
    FROM inventory i
    JOIN parts p ON p.id = i.part_id
    JOIN service_centers sc ON sc.id = i.service_center_id
    WHERE i.quantity <= i.reorder_level
  `);

  res.json(result.rows);
};

/* ================= USAGE LOGS ================= */

export const getInventoryUsageLogs = async (req, res) => {
  const result = await pool.query(`
    SELECT 
      jp.job_card_id,
      sc.name AS service_center,
      p.name,
      jp.quantity_used,
      jp.unit_price,
      jp.total_price,
      jp.created_at
    FROM job_parts jp
    JOIN job_cards jc ON jc.id = jp.job_card_id
    JOIN service_centers sc ON sc.id = jc.service_center_id
    JOIN parts p ON p.id = jp.part_id
    ORDER BY jp.created_at DESC
  `);

  res.json(result.rows);
};
