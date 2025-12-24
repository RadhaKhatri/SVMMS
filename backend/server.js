import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import serviceCenterRoutes from "./routes/serviceCenterRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import mechanicRoutes from "./routes/mechanicsRoutes.js";
import managerInvoiceRoutes from "./routes/ManagerInvoiceRoutes.js";
import adminDashboardRoutes from "./routes/adminRoutes.js";

dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:8080",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/service-centers", serviceCenterRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/mechanic", mechanicRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/manager/invoice", managerInvoiceRoutes);
app.use("/api", adminDashboardRoutes);


app.get("/", (req, res) => res.send("Server running!"));


// Start server
app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
