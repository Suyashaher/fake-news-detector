# 🛡️ FakeGuard AI — Fake News Detection Web Application

A production-ready, full-stack fake news detection platform powered by **DistilBERT** deep learning. Analyze news articles for authenticity, sentiment, and credibility.

## 📂 Project Structure

```
Fake News Detection/
├── ai_service/              # Python AI microservice
│   ├── main.py              # FastAPI server (port 8000)
│   ├── train.py             # DistilBERT training script
│   ├── requirements.txt     # Python dependencies
│   └── fake_news_model/     # Saved model (after training)
├── backend/                 # Node.js API server
│   ├── server.js            # Express entry point (port 5000)
│   ├── config/db.js         # MongoDB connection
│   ├── models/              # Mongoose schemas
│   ├── controllers/         # Route handlers
│   ├── middleware/           # Auth & rate limiting
│   └── routes/              # API routes
├── frontend/                # React + TailwindCSS UI
│   ├── src/
│   │   ├── pages/           # Login, Register, Dashboard, History, Admin
│   │   ├── components/      # Reusable UI components
│   │   └── context/         # Auth context
│   └── index.html
└── dataset/                 # Training data
    ├── True.csv
    └── Fake.csv
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **Python** 3.9+
- **MongoDB** (local or Atlas)

### 1. AI Service

```bash
cd ai_service
pip install -r requirements.txt

# (Optional) Train the DistilBERT model — requires GPU, ~1-2 hours
python train.py

# Start the FastAPI server (works without training — uses fallback)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Backend

```bash
cd backend
npm install

# Configure environment
# Edit .env with your MongoDB URI and JWT secret

npm start
# Server runs on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fakenews
JWT_SECRET=your_jwt_secret_key_change_in_production
AI_SERVICE_URL=http://localhost:8000
```

## 📡 API Endpoints

### Auth
| Method | Endpoint             | Description       |
|--------|---------------------|--------------------|
| POST   | `/api/auth/register` | Create account     |
| POST   | `/api/auth/login`    | Login              |
| GET    | `/api/auth/me`       | Get profile        |

### Predictions
| Method | Endpoint                | Description          |
|--------|------------------------|----------------------|
| POST   | `/api/predict`          | Analyze article      |
| GET    | `/api/predict/history`  | Get history          |

### Admin
| Method | Endpoint            | Description         |
|--------|--------------------|-----------------------|
| GET    | `/api/admin/stats`  | Dashboard stats       |
| GET    | `/api/admin/users`  | List all users        |

### AI Service (Direct)
| Method | Endpoint    | Description              |
|--------|------------|--------------------------|
| POST   | `/predict`  | DistilBERT prediction    |
| GET    | `/health`   | Service health check     |

## 🧠 Model Details

- **Model**: `distilbert-base-uncased`
- **Max Length**: 512 tokens
- **Training**: 3 epochs, batch size 8, lr 5e-5, AdamW
- **Fallback**: Keyword-based heuristic classifier when trained model is unavailable

## ✨ Features

- 🤖 **AI-Powered Detection** — DistilBERT fake news classification
- 📊 **Confidence Meter** — Animated circular gauge
- 🎯 **Suspicious Sentences** — Color-coded risk highlighting
- 💬 **Sentiment Analysis** — TextBlob polarity & subjectivity
- 🛡️ **Credibility Score** — Multi-signal trust assessment
- 📈 **Fake vs Real Chart** — Recharts donut visualization
- 🖼️ **Deepfake Detection** — Image upload with mock analysis (beta)
- 👤 **JWT Authentication** — Secure login & registration
- 📜 **Prediction History** — Paginated analysis records
- 🔐 **Admin Dashboard** — System-wide stats & user management
- ⚡ **Rate Limiting** — API abuse prevention
- 📱 **Responsive Design** — Mobile-first with glassmorphism UI

## 📝 License

MIT
