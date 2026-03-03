/**
 * Admin Controller
 * Dashboard statistics and user management
 */

const User = require("../models/User");
const Prediction = require("../models/Prediction");

/**
 * GET /api/admin/stats
 * Get dashboard statistics (admin only)
 */
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPredictions = await Prediction.countDocuments();
    const fakePredictions = await Prediction.countDocuments({ prediction: "Fake" });
    const truePredictions = await Prediction.countDocuments({ prediction: "True" });

    // Recent predictions (last 10)
    const recentPredictions = await Prediction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email")
      .select("prediction confidence createdAt inputText");

    // Predictions per day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyStats = await Prediction.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          fakeCount: { $sum: { $cond: [{ $eq: ["$prediction", "Fake"] }, 1, 0] } },
          trueCount: { $sum: { $cond: [{ $eq: ["$prediction", "True"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Average confidence
    const avgConfidence = await Prediction.aggregate([
      { $group: { _id: null, avg: { $avg: "$confidence" } } },
    ]);

    res.json({
      totalUsers,
      totalPredictions,
      fakePredictions,
      truePredictions,
      averageConfidence: avgConfidence[0]?.avg?.toFixed(2) || 0,
      recentPredictions,
      dailyStats,
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);
    res.status(500).json({ error: "Failed to fetch admin statistics" });
  }
};

/**
 * GET /api/admin/users
 * List all users (admin only)
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -__v")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error("Admin users error:", error.message);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

module.exports = { getStats, getUsers };
