-- =============================
-- 1) USERS
-- =============================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(30) CHECK(role IN ('customer','mechanic','service_center_manager','admin')),
    phone VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================
-- 2) SERVICE CENTERS
-- =============================
CREATE TABLE service_centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150),
    address TEXT,
    city VARCHAR(100),
    contact_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 3) MECHANICS MAPPED TO SERVICE CENTERS
-- ============================================
CREATE TABLE service_center_mechanics (
    id SERIAL PRIMARY KEY,
    service_center_id INT REFERENCES service_centers(id) ON DELETE CASCADE,
    mechanic_id INT REFERENCES users(id) ON DELETE CASCADE
);

-- =============================
-- 4) VEHICLES
-- =============================
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES users(id) ON DELETE CASCADE,
    vin VARCHAR(50) UNIQUE,
    make VARCHAR(100),
    model VARCHAR(100),
    year INT,
    engine_type VARCHAR(50),
    mileage INT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================
-- 5) SERVICE BOOKINGS
-- =============================
CREATE TABLE service_bookings (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES users(id) ON DELETE CASCADE,
    vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
    service_center_id INT REFERENCES service_centers(id) ON DELETE CASCADE,
    service_type VARCHAR(100),
    preferred_date DATE,
    preferred_time TIME,
    status VARCHAR(20) CHECK(status IN ('pending','approved','rejected','cancelled')),
    approved_by INT REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================
-- 6) JOB CARDS
-- =============================
CREATE TABLE job_cards (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES service_bookings(id) ON DELETE CASCADE,
    service_center_id INT REFERENCES service_centers(id) ON DELETE CASCADE,
    vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
    customer_id INT REFERENCES users(id) ON DELETE CASCADE,
    assigned_mechanic INT REFERENCES users(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    status VARCHAR(20) CHECK(status IN ('open','in_progress','completed','delivered')),
    notes TEXT,
    total_labor_cost DECIMAL(10,2) DEFAULT 0.00,
    total_parts_cost DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================
-- 7) JOB TASKS
-- =============================
CREATE TABLE job_tasks (
    id SERIAL PRIMARY KEY,
    job_card_id INT REFERENCES job_cards(id) ON DELETE CASCADE,
    description VARCHAR(255),
    hours DECIMAL(5,2),
    labor_rate DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================
-- 8) PARTS
-- =============================
CREATE TABLE parts (
    id SERIAL PRIMARY KEY,
    part_code VARCHAR(50) UNIQUE,
    name VARCHAR(150),
    description TEXT,
    unit_price DECIMAL(10,2),
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================
-- 9) INVENTORY (Service center wise)
-- =============================
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    service_center_id INT REFERENCES service_centers(id) ON DELETE CASCADE,
    part_id INT REFERENCES parts(id) ON DELETE CASCADE,
    quantity INT,
    reorder_level INT,
    location VARCHAR(100),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================
-- 10) JOB PARTS
-- =============================
CREATE TABLE job_parts (
    id SERIAL PRIMARY KEY,
    job_card_id INT REFERENCES job_cards(id) ON DELETE CASCADE,
    part_id INT REFERENCES parts(id) ON DELETE CASCADE,
    quantity_used INT,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================
-- 11) INVOICES
-- =============================
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    job_card_id INT REFERENCES job_cards(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE,
    parts_total DECIMAL(10,2),
    labor_total DECIMAL(10,2),
    tax DECIMAL(10,2),
    discount DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    status VARCHAR(20) CHECK(status IN ('unpaid','paid')),
    issued_at TIMESTAMP DEFAULT NOW()
);

-- =============================
-- 12) PASSWORD RESET
-- =============================
CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255),
    expires_at TIMESTAMP
);
