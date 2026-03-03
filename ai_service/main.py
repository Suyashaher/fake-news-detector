"""
Fake News Detection — FastAPI AI Microservice
==============================================
POST /predict  → returns prediction, confidence, sentiment, credibility
Includes a keyword-based dummy fallback when the trained model is unavailable.
"""

import os
import re
import random
from typing import Optional

import torch
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from textblob import TextBlob

# ─── Configuration ─────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "fake_news_model")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# ─── FastAPI App ───────────────────────────────────────────────────────────────
app = FastAPI(
    title="Fake News Detection API",
    description="DistilBERT-powered fake news classifier with sentiment & credibility analysis",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Global model references ──────────────────────────────────────────────────
tokenizer = None
model = None
USE_DUMMY = False


# ─── Load model on startup ────────────────────────────────────────────────────
@app.on_event("startup")
def load_model():
    """Try to load the trained DistilBERT model; fall back to dummy if unavailable."""
    global tokenizer, model, USE_DUMMY

    if os.path.isdir(MODEL_DIR) and os.path.exists(os.path.join(MODEL_DIR, "config.json")):
        try:
            from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

            tokenizer = DistilBertTokenizer.from_pretrained(MODEL_DIR)
            model = DistilBertForSequenceClassification.from_pretrained(MODEL_DIR)
            model.to(DEVICE)
            model.eval()
            print("✅ Trained DistilBERT model loaded successfully")
        except Exception as e:
            print(f"⚠️  Failed to load model: {e}. Using dummy fallback.")
            USE_DUMMY = True
    else:
        print("⚠️  No trained model found. Using dummy fallback classifier.")
        USE_DUMMY = True


# ─── Request / Response schemas ───────────────────────────────────────────────
class PredictRequest(BaseModel):
    text: str


class SentenceScore(BaseModel):
    sentence: str
    score: float  # 0-1, higher = more suspicious


class PredictResponse(BaseModel):
    prediction: str  # "Fake" or "True"
    confidence: float  # percentage 0–100
    sentiment: dict  # {label, polarity, subjectivity}
    credibility_score: float  # 0–100
    suspicious_sentences: list[SentenceScore]


# ─── Helper: Dummy classifier ─────────────────────────────────────────────────
FAKE_KEYWORDS = [
    "breaking", "shocking", "unbelievable", "you won't believe",
    "secret", "conspiracy", "hoax", "exposed", "coverup",
    "mainstream media", "they don't want you to know",
    "urgent", "bombshell", "exclusive", "anonymous sources",
]


def dummy_predict(text: str) -> tuple[str, float]:
    """Keyword-heuristic fallback classifier."""
    lower = text.lower()
    matches = sum(1 for kw in FAKE_KEYWORDS if kw in lower)
    fake_prob = min(0.5 + matches * 0.08, 0.95)

    # Add some randomness so it's not perfectly deterministic
    fake_prob += random.uniform(-0.05, 0.05)
    fake_prob = max(0.1, min(0.95, fake_prob))

    if fake_prob > 0.5:
        return "Fake", round(fake_prob * 100, 2)
    else:
        return "True", round((1 - fake_prob) * 100, 2)


# ─── Helper: Model prediction ─────────────────────────────────────────────────
def model_predict(text: str) -> tuple[str, float]:
    """Run DistilBERT inference."""
    encoding = tokenizer.encode_plus(
        text,
        add_special_tokens=True,
        max_length=512,
        padding="max_length",
        truncation=True,
        return_attention_mask=True,
        return_tensors="pt",
    )

    input_ids = encoding["input_ids"].to(DEVICE)
    attention_mask = encoding["attention_mask"].to(DEVICE)

    with torch.no_grad():
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        probs = torch.softmax(outputs.logits, dim=1).cpu().numpy()[0]

    pred_label = int(np.argmax(probs))
    confidence = round(float(probs[pred_label]) * 100, 2)
    prediction = "Fake" if pred_label == 1 else "True"
    return prediction, confidence


# ─── Helper: Sentiment Analysis ───────────────────────────────────────────────
def analyze_sentiment(text: str) -> dict:
    """Lightweight sentiment analysis via TextBlob."""
    blob = TextBlob(text)
    polarity = round(blob.sentiment.polarity, 3)
    subjectivity = round(blob.sentiment.subjectivity, 3)

    if polarity > 0.1:
        label = "Positive"
    elif polarity < -0.1:
        label = "Negative"
    else:
        label = "Neutral"

    return {"label": label, "polarity": polarity, "subjectivity": subjectivity}


# ─── Helper: Source Credibility (mock) ──────────────────────────────────────
TRUSTED_DOMAINS = [
    "reuters.com", "apnews.com", "bbc.com", "nytimes.com",
    "theguardian.com", "washingtonpost.com", "npr.org",
]


def credibility_score(text: str) -> float:
    """Mock credibility scoring based on text features."""
    score = 50.0  # neutral baseline

    lower = text.lower()

    # Positive signals
    if any(d in lower for d in TRUSTED_DOMAINS):
        score += 25
    if "according to" in lower or "study shows" in lower:
        score += 10
    if re.search(r"\d{4}", text):  # contains a year
        score += 5

    # Negative signals
    exclamation_count = text.count("!")
    score -= exclamation_count * 3
    caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    if caps_ratio > 0.3:
        score -= 15

    return round(max(0, min(100, score)), 1)


# ─── Helper: Suspicious Sentence Scorer ────────────────────────────────────────
def score_sentences(text: str) -> list[dict]:
    """Score individual sentences for suspiciousness."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    results = []

    for sent in sentences[:20]:  # limit to first 20 sentences
        if len(sent.strip()) < 10:
            continue

        sus_score = 0.0
        lower = sent.lower()

        # Sensational keywords
        for kw in FAKE_KEYWORDS:
            if kw in lower:
                sus_score += 0.15

        # ALL CAPS words
        words = sent.split()
        caps_words = sum(1 for w in words if w.isupper() and len(w) > 2)
        sus_score += caps_words * 0.1

        # Excessive punctuation
        sus_score += sent.count("!") * 0.1
        sus_score += sent.count("?") * 0.05

        # High subjectivity
        blob = TextBlob(sent)
        if blob.sentiment.subjectivity > 0.7:
            sus_score += 0.15

        sus_score = round(min(sus_score, 1.0), 2)
        results.append({"sentence": sent.strip(), "score": sus_score})

    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    return results


# ─── Prediction Endpoint ──────────────────────────────────────────────────────
@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    """Analyze a news article for authenticity."""
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text field cannot be empty")

    # Prediction
    if USE_DUMMY:
        prediction, confidence = dummy_predict(text)
    else:
        prediction, confidence = model_predict(text)

    # Sentiment
    sentiment = analyze_sentiment(text)

    # Credibility
    cred = credibility_score(text)

    # Suspicious sentences
    suspicious = score_sentences(text)

    return PredictResponse(
        prediction=prediction,
        confidence=confidence,
        sentiment=sentiment,
        credibility_score=cred,
        suspicious_sentences=[SentenceScore(**s) for s in suspicious],
    )


# ─── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "model": "dummy" if USE_DUMMY else "distilbert"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
