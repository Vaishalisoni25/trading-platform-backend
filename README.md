# Tradetron-Style No-Code Algo Trading Platform Backend

Backend architecture for a scalable, no-code algorithmic trading and strategy automation platform serving:
- **Mobile App** (Android / iOS)
- **Web App** (Trader Portal)
- **Admin Panel** (Central Operations & Risk Control)

---

## 📁 Project Architecture & Folder Structure

```text
trading-platform-backend/
├── src/
│   ├── config/               # Database connection (db.js) & environment configs
│   ├── models/               # MongoDB Mongoose schemas (User, Strategy, Order, etc.)
│   ├── controllers/
│   │   ├── user/             # Endpoints for Mobile App & Web User
│   │   └── admin/            # Endpoints for Admin Panel
│   ├── routes/
│   │   ├── user/             # User API routes (/api/v1/...)
│   │   └── admin/            # Admin API routes (/api/v1/admin/...)
│   ├── services/             # Core business logic layer
│   ├── middlewares/          # Auth JWT, Role verification, Error handlers
│   ├── strategy-engine/      # Condition evaluator, indicator calculator, signal generator
│   ├── trading-engine/       # Order router, position manager, risk manager
│   ├── backtesting/          # Historical simulation & performance reporting
│   ├── integrations/
│   │   └── brokers/          # Broker adapter interfaces (Zerodha, Upstox, AngelOne, etc.)
│   ├── utils/                # Helper functions, formatters, validators
│   ├── app.js                # Express app setup, middlewares, routes mounting
│   └── server.js             # Server bootstrap & MongoDB connection
│
├── .env.example              # Environment variables template
├── .gitignore                # Files excluded from Git tracking
├── package.json              # Project dependencies & scripts
└── README.md                 # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ or v22+)
- [MongoDB](https://www.mongodb.com/) (Local Community Server or MongoDB Atlas cloud cluster)

### 2. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your `MONGO_URI` in `.env`:
- **Local MongoDB**: `mongodb://localhost:27017/algo_trading_platform`
- **MongoDB Atlas**: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/algo_trading_platform?retryWrites=true&w=majority`

### 3. Run Development Server
```bash
# Start with auto-reload (nodemon)
npm run dev

# Or start standard production server
npm start
```

### 4. Verify Server
Open browser or Postman and hit:
- `http://localhost:5000/api/health`
