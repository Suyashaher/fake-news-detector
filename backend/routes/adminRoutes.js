/**
 * Admin Routes
 * GET /api/admin/stats  — dashboard statistics
 * GET /api/admin/users  — list all users
 */

const express = require("express");
const router = express.Router();
const { getStats, getUsers } = require("../controllers/adminController");
const { auth, adminOnly } = require("../middleware/auth");

router.get("/stats", auth, adminOnly, getStats);
router.get("/users", auth, adminOnly, getUsers);

module.exports = router;
