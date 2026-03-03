/**
 * Fake News Detection Backend — Entry Point
 * Express server with MongoDB, JWT auth, rate limiting
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const rateLimiter = require("./middleware/rateLimiter");

// Import routes
const authRoutes = require("./routes/authRoutes");
const predictRoutes = require("./routes/predictRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(rateLimiter);

// ─── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/admin", adminRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "backend" });
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});

module.exports = app;
