# Tradetron-Style No-Code Algo Trading Platform Backend

Backend architecture for a scalable, no-code algorithmic trading and strategy automation platform serving:
- **Mobile App** (Android / iOS)
- **Web App** (Trader Portal)
- **Admin Panel** (Central Operations & Risk Control)

---

## 📁 Project Architecture & Folder Structure

```text
trading-platform-backend/
├── prisma/
│   ├── schema.prisma         # PostgreSQL models & database schema
├── src/
│   ├── config/               # Database connection (db.js) & Prisma client instance
│   ├── models/               # Application-level data models / schemas
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
│   └── server.js             # Server bootstrap & PostgreSQL connection
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
- [PostgreSQL](https://www.postgresql.org/) (Local installation or Cloud: Supabase / Neon / Render)

### 2. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/trading_platform?schema=public"
```

### 3. Prisma Commands
```bash
# Generate Prisma Client
npx prisma generate

# Create/apply migrations
npx prisma migrate dev --name init

# Open Prisma Studio (Database GUI)
npx prisma studio
```

### 4. Run Development Server
```bash
# Start with auto-reload (nodemon)
npm run dev

# Or start standard production server
npm start
```

### 5. Verify Server
Open browser or Postman and hit:
- `http://localhost:5000/api/health`
