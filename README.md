# 🚗 Smart Vehicle Maintenance and Service Management System (SVMMS)

## 📌 Project Overview

The **Smart Vehicle Maintenance and Service Management System (SVMMS)** is a full-stack web-based application designed to automate and streamline vehicle servicing operations. The system connects **customers**, **service center managers**, **mechanics**, and **administrators** on a single digital platform.

It replaces manual, paper-based service management with **online booking**, **digital job cards**, **inventory tracking**, and **automated invoice generation**, ensuring transparency, efficiency, and scalability across multiple service centers.

---

## 🎯 Problem Statement

Traditional vehicle service management relies heavily on manual processes such as phone calls, physical visits, handwritten job cards, and manual inventory tracking. This leads to:

* Delays in booking and approvals
* Lack of transparency for customers
* Poor job progress tracking
* Inventory mismanagement
* Errors in billing and record-keeping

There is no unified platform where customers can compare service centers, track job progress, or receive digital invoices.

**SVMMS addresses these issues by providing a centralized digital solution for vehicle service booking, job management, inventory control, and billing.**

---

## 🎯 Objectives

### Customer Objectives

* Register and log in securely
* Add and manage vehicle details
* Book service appointments
* Choose preferred service centers
* Track service progress and history
* View and download digital invoices

### Service Center / Mechanic Objectives

* Approve or reject service bookings
* Create and manage digital job cards
* Assign mechanics to jobs
* Track job progress in real time
* Manage spare part usage
* Auto-update inventory
* Generate accurate invoices

### Admin Objectives

* Manage users and service centers
* Monitor system-wide operations
* View analytics and reports
* Track inventory usage and revenue trends

---

## 🧱 Technology Stack

### Frontend

* **React 18** – UI Library
* **TypeScript** – Type Safety
* **Vite** – Build Tool & Dev Server
* **Tailwind CSS** – Utility-first Styling
* **shadcn/ui** – Reusable UI Components
* **Lucide React** – Icons
* **React Router DOM** – Client-side Routing
* **Axios** – API Communication
* **Recharts** – Analytics & Charts

### Backend

* **Node.js**
* **Express.js** – REST API Framework
* **PostgreSQL** – Relational Database
* **JWT** – Authentication & Authorization
* **bcrypt** – Password Hashing
* **nodemailer** – Email Services

---

## 📂 Project Structure

```
svmms/
│
├── backend/
│   ├── config/        # Environment & constants
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth & role checks
│   ├── models/       # DB queries
│   ├── routes/       # API endpoints
│   ├── utils/        # Helpers
│   ├── uploads/      # Documents (if any)
│   ├── server.js     # API entry point
│   ├── db.js         # PostgreSQL connection
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/        # Axios API calls
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── context/    # Auth & global state
│   │   ├── utils/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── vite.config.ts
│
├── README.md
└── package.json
```

---

## 👥 User Roles & Responsibilities

| Role                   | Responsibilities                                                        |
| ---------------------- | ----------------------------------------------------------------------- |
| Customer               | Book services, manage vehicles, track jobs, view invoices               |
| Mechanic               | View assigned job cards, update job progress                            |
| Service Center Manager | Approve bookings, assign mechanics, manage inventory, generate invoices |
| Admin                  | Monitor system, analytics, manage users & service centers               |

---

## 🔄 System Workflow

1. Manager registers and logs in
2. Manager creates a Service Center
3. Mechanics register and request to join a Service Center
4. Manager approves mechanics
5. Customer selects a Service Center and books service
6. Booking appears in Manager Dashboard
7. Manager approves booking → Job Card created
8. Mechanic works on job card
9. Parts used → Inventory auto-deducted
10. Job completed → Invoice generated

---

## 🗃️ Database Design

The system uses a **normalized relational database** with key tables:

* users
* service_centers
* vehicles
* service_bookings
* job_cards
* job_tasks
* parts
* inventory
* job_parts
* invoices

Each module is connected using foreign keys to ensure data integrity and scalability.

---

## 📊 Diagrams Included

* System Architecture Diagram
* Use Case Diagram
* ER Diagram
* Data Flow Diagram (Level 0 & Level 1)
* Activity Diagram

These diagrams help visualize system behavior, data movement, and role interactions.

---

## 🚀 Installation & Setup

### Backend Setup

```bash
cd svmms/backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd svmms/frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`
Backend runs at: `http://localhost:5000`

---

## 📈 Future Enhancements

* Online payment gateway integration
* Real-time notifications (WebSockets)
* Mobile application
* Predictive maintenance using ML
* Multi-service-center per manager

---

## 🎓 Learning Outcomes

* Full-stack system architecture understanding
* Real-world business logic implementation
* Secure role-based access control
* Database normalization & relational mapping
* RESTful API design
* UI/UX integration with backend services

---

## ✅ Conclusion

SVMMS is a scalable, real-world-ready solution that digitizes vehicle service operations. It improves efficiency, transparency, and customer satisfaction while providing service centers with powerful management tools.

This project demonstrates strong full-stack development skills and practical domain understanding in automotive service management.

