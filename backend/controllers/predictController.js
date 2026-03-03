/**
 * Predict Controller
 * Proxies requests to the AI microservice and stores history
 */

const axios = require("axios");
const Prediction = require("../models/Prediction");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * POST /api/predict
 * Send text to AI service, save result, return response
 */
const predict = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Call AI microservice
    // Handle case where AI_SERVICE_URL already ends with /predict from the .env
    const endpoint = AI_SERVICE_URL.endsWith('/predict') 
        ? AI_SERVICE_URL 
        : `${AI_SERVICE_URL}/predict`;
        
    const aiResponse = await axios.post(endpoint, { text });
    const result = aiResponse.data;

    // Save to prediction history
    const prediction = await Prediction.create({
      user: req.user._id,
      inputText: text.substring(0, 50000), // cap storage
      prediction: result.prediction,
      confidence: result.confidence,
      sentiment: result.sentiment,
      credibilityScore: result.credibility_score,
      suspiciousSentences: result.suspicious_sentences,
    });

    res.json({
      id: prediction._id,
      prediction: result.prediction,
      confidence: result.confidence,
      sentiment: result.sentiment,
      credibilityScore: result.credibility_score,
      suspiciousSentences: result.suspicious_sentences,
    });
  } catch (error) {
    console.error("Predict error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "AI service is unavailable. Please ensure the AI service is running on port 8000.",
      });
    }

    res.status(500).json({ error: "Failed to process prediction" });
  }
};

/**
 * GET /api/predict/history
 * Get current user's prediction history
 */
const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Prediction.countDocuments({ user: req.user._id });
    const predictions = await Prediction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v");

    res.json({
      predictions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("History error:", error.message);
    res.status(500).json({ error: "Failed to fetch prediction history" });
  }
};

module.exports = { predict, getHistory };
