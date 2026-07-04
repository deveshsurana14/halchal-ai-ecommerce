# Halchal Industries - AI-Powered Pricing & E-Commerce Platform

> A full-stack B2B e-commerce system with a machine learning pricing engine built for **Halchal Industries**, a drip irrigation manufacturer based in Pune, Maharashtra.

**Live:** [halchal-frontend.vercel.app/home](https://halchal-frontend.vercel.app/home)

---

## What This Project Solves

Halchal Industries sells drip irrigation pipes across India through regional distributors. Pricing was done manually, with no visibility into seasonal demand, regional market maturity, or competitor positioning, leading to lost margins in high-demand zones and slow movement in price-sensitive ones.

This system replaces that with:
- An ML model that forecasts demand per region and season
- A multi-factor pricing engine that outputs recommended ex-factory prices
- An admin approval workflow so the business retains full control before prices go live
- A full B2B storefront with cart, checkout, and Razorpay payment integration

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS, Recharts |
| Backend API | Node.js, Express.js |
| Database | MongoDB Atlas |
| ML Model | Python, Scikit-learn (RandomForest + GradientBoosting) |
| ML API | Flask |
| Payments | Razorpay |
| Deployment | Vercel (frontend), Render (backend + ML API) |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│              React Frontend                  │
│   (Vercel — halchal-frontend.vercel.app)     │
└──────────────┬──────────────────────────────┘
               │ REST API calls
┌──────────────▼──────────────────────────────┐
│         Node.js / Express Backend            │
│              (Render)                        │
│                                             │
│  ┌─────────────┐    ┌────────────────────┐  │
│  │ MongoDB Atlas│    │  Flask ML API      │  │
│  │ (Auth, Orders│    │  (Render)          │  │
│  │  Cart, Stock)│    │  /calculate-price  │  │
│  └─────────────┘    └────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## ML Pricing Engine

The core of the project. The pricing system works in two parts:

### 1. Demand Forecasting Model (`train_model.py`)
- Trained on **30,000+ synthetic records** modelled on NABARD Micro-Irrigation Report 2023-24 data
- Covers **20 Indian states**, **5 geographic zones**, **4 pipe SKUs**, 5 years of seasonality
- Features: pipe type, zone ID, drip-adoption index, season, month, year, previous sales ratio, govt subsidy flag
- Both RandomForest and GradientBoosting are trained; the better R² model is selected automatically

### 2. Multi-Factor Pricing Pipeline (`ml_api.py`)
Once demand is predicted, the Flask API applies three pricing factors:

```
Final Price = Base Price × Demand Factor × Adoption Factor × Competitor Factor
```

| Factor | Range | Logic |
|---|---|---|
| Demand Factor | 0.82 – 1.22 | ML-predicted demand vs zone average (sensitivity: 0.35) |
| Adoption Factor | 0.90 – 1.10 | NABARD drip-adoption index per state (Gujarat: 1.42, Assam: 0.36) |
| Competitor Factor | 0.92 – 1.10 | Undercut in weak demand; price toward ceiling in strong demand |

Price is smoothed (50% base / 50% ML signal) and rounded to the nearest ₹10 to avoid distributor confusion.

**Cold-start resilience:** If the ML API is unavailable, the backend falls back to realistic Maharashtra/Kharif baseline values within 10 seconds.

---

## Features

### Customer / Distributor
- Browse 6 drip pipe products across 4 SKU categories
- Select state/zone to get ML-recommended price for that region
- Add to cart (persisted in MongoDB by session ID)
- Bulk discount tiers: 10% (5+ coils), 20% (100+ coils)
- GST @ 12% auto-calculated (HSN 3917 — polyethylene irrigation pipes)
- Checkout via **Razorpay** (HMAC-SHA256 signature verification)
- User registration and login (bcrypt password hashing)

### Admin Panel
- **Pricing Approvals** — review ML-recommended prices per product/zone, approve or reject before they go live
- **Stock Management** — view and update inventory levels per SKU
- **Orders** — view all orders, approve pending bulk orders
- **Contact Messages** — inbox for customer enquiries submitted via the contact form
- **Dashboard** — overview stats with Recharts graphs
- Protected routes — admin login required, no public access

---

## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create user account (bcrypt) |
| POST | `/api/auth/login` | Login and return user session |

### Pricing
| Method | Route | Description |
|---|---|---|
| POST | `/api/ai-price` | Get ML-recommended price for pipe + zone |
| POST | `/api/approve-price` | Admin approves a price (saves to DB) |
| GET | `/api/approved-prices` | Get all approved prices |
| GET | `/api/approved-prices/current` | Check if a price is approved for current month |

### Cart
| Method | Route | Description |
|---|---|---|
| POST | `/api/cart/sync` | Upsert cart by session ID |
| GET | `/api/cart/:sessionId` | Load cart |
| DELETE | `/api/cart/:sessionId` | Clear cart |

### Orders
| Method | Route | Description |
|---|---|---|
| POST | `/api/orders` | Place order (deducts stock, flags bulk for approval) |
| GET | `/api/orders` | Admin — get all orders |
| POST | `/api/orders/approve/:id` | Admin — approve a pending order |

### Stock
| Method | Route | Description |
|---|---|---|
| GET | `/api/stock` | Get all stock levels |
| POST | `/api/stock/update` | Update stock quantity |

### Payments
| Method | Route | Description |
|---|---|---|
| POST | `/api/payment/create-order` | Create Razorpay order |
| POST | `/api/payment/verify` | Verify HMAC signature + save orders |

### ML API (Flask — port 5001)
| Method | Route | Description |
|---|---|---|
| POST | `/calculate-price` | Returns demand forecast + recommended price |
| GET | `/` | Health check |

---

## Project Structure

```
final_yr_project/
├── backend/
│   ├── ml/
│   │   ├── train_model.py          # Model training script
│   │   ├── ml_api.py               # Flask pricing API
│   │   ├── rf_demand_model.pkl     # Trained model
│   │   ├── label_encoders.pkl      # Encoders for categorical features
│   │   ├── avg_demand.json         # Baseline demand stats
│   │   └── requirements.txt
│   ├── model/
│   │   ├── User.js
│   │   ├── Order.js
│   │   ├── Cart.js
│   │   ├── Stock.js
│   │   └── ApprovedPrice.js
│   ├── utils/
│   │   └── pricingEngine.js        # Discount + GST calculation
│   └── server.js                   # Express app + all routes
├── frontend/
│   └── halchal-ai-ecommerce/
│       └── src/
│           ├── pages/              # Home, Products, Cart, Login, etc.
│           ├── pages/admin/        # Dashboard, Orders, PricingApprovals, etc.
│           ├── components/         # Navbar, ChatBot, ProtectedRoute
│           └── context/            # Auth, Cart, Theme contexts
└── docs/
    ├── ERD.svg
    ├── ClassDiagram.html
    └── powerbi_data/               # CSVs for Power BI demand analysis
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Atlas account
- Razorpay account (test keys)

### 1. Backend (Node.js)

```bash
cd backend
npm install
```

Create `backend/.env`:
```
MONGO_URI=your_mongodb_atlas_uri
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ML_API_URL=http://localhost:5001
```

```bash
node server.js
```

### 2. ML API (Flask)

```bash
cd backend/ml
pip install -r requirements.txt

# Train the model (generates .pkl files)
python train_model.py

# Start the Flask API
python ml_api.py
```

### 3. Frontend (React)

```bash
cd frontend/halchal-ai-ecommerce
npm install
npm start
```

Create `frontend/halchal-ai-ecommerce/.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Auto-deploys from GitHub |
| Node.js API | Render | Set env vars in Render dashboard |
| Flask ML API | Render | Deploy `backend/ml/` with `python ml_api.py` as start command |

---

## Key Design Decisions

**Why synthetic training data?**
Halchal Industries had no historical digital sales records. The training dataset was modelled using NABARD drip-adoption indices, known seasonal patterns (Kharif/Rabi/Summer), and product-specific base demand — grounded in real agricultural market data, not arbitrary numbers.

**Why human-in-the-loop pricing?**
Fully automated pricing is a liability for a small manufacturer with long-term distributor relationships. The admin approval step ensures no price goes live without a human review, while still surfacing the ML recommendation as a starting point.

**Why 50/50 price smoothing?**
A pure ML price can swing ±22% month to month as demand signals shift. Blending 50% base price + 50% ML output keeps prices stable enough for distributors to plan around, while still reflecting market signals.

---

## Author

**Devesh Surana**
B.E. in Artificial Intelligence & Data Science, Ajeenkya D.Y. Patil School of Engineering, Pune (2026)

[LinkedIn](https://linkedin.com/in/devesh-surana) · [GitHub](https://github.com/deveshsurana14) · deveshsurana14@gmail.com
