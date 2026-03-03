/**
 * Prediction Model — Mongoose Schema
 * Stores user prediction history with results
 */

const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inputText: {
      type: String,
      required: true,
      maxlength: 50000,
    },
    prediction: {
      type: String,
      enum: ["Fake", "True"],
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
    },
    sentiment: {
      label: String,
      polarity: Number,
      subjectivity: Number,
    },
    credibilityScore: {
      type: Number,
      default: 50,
    },
    suspiciousSentences: [
      {
        sentence: String,
        score: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prediction", predictionSchema);
