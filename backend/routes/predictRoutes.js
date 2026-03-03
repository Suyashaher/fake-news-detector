/**
 * Predict Routes
 * POST /api/predict      — analyze news article
 * GET  /api/predict/history — get user's history
 */

const express = require("express");
const router = express.Router();
const { predict, getHistory } = require("../controllers/predictController");
const { auth } = require("../middleware/auth");

router.post("/", auth, predict);
router.get("/history", auth, getHistory);

module.exports = router;
