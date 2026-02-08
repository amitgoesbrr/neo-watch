# 🌌 Neo-Watch Backend

Backend API for Neo-Watch - Near Earth Object Monitoring Platform.

A comprehensive API for tracking Near-Earth Objects (NEOs), providing risk analysis, user authentication, watchlists, alerts, and real-time chat functionality.

## 🚀 Tech Stack

| Technology                                           | Purpose                              |
| ---------------------------------------------------- | ------------------------------------ |
| [Bun](https://bun.sh/)                               | JavaScript runtime & package manager |
| [Elysia](https://elysiajs.com/)                      | Fast, type-safe web framework        |
| [PostgreSQL](https://www.postgresql.org/)            | Primary database                     |
| [Drizzle ORM](https://orm.drizzle.team/)             | Type-safe database ORM               |
| [JWT](https://jwt.io/)                               | Authentication tokens                |
| [Node-Cron](https://www.npmjs.com/package/node-cron) | Background job scheduling            |

## 📋 Prerequisites

- [Bun](https://bun.sh/) v1.0+
- [PostgreSQL](https://www.postgresql.org/) 14+
- NASA API Key (free at [api.nasa.gov](https://api.nasa.gov/))

## 🛠️ Installation

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your values:

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/neo_watch
   NASA_API_KEY=your_nasa_api_key
   JWT_SECRET=your_super_secret_key
   ```

3. **Set up the database:**

   ```bash
   # Start PostgreSQL with Docker
   docker-compose up -d

   # Push schema to database
   bun run db:push
   ```

4. **Start the development server:**

   ```bash
   bun run dev
   ```

   Server will start at `http://localhost:4000`

## 📚 API Documentation

- **Swagger UI**: http://localhost:4000/docs
- **Full API Reference**: [API_DOCS.md](./API_DOCS.md)

### Endpoints Overview

| Category   | Endpoint                              | Description           |
| ---------- | ------------------------------------- | --------------------- |
| **Health** | `GET /`                               | API status            |
| **Health** | `GET /health`                         | Health check          |
| **Auth**   | `POST /api/auth/register`             | Register user         |
| **Auth**   | `POST /api/auth/login`                | Login user            |
| **Auth**   | `GET /api/auth/me`                    | Get current user      |
| **Auth**   | `POST /api/auth/refresh`              | Refresh JWT token     |
| **NEO**    | `GET /api/neo/feed`                   | Get today's NEOs      |
| **NEO**    | `GET /api/neo/stats`                  | Get NEO statistics    |
| **NEO**    | `GET /api/neo/browse`                 | Browse all NEOs       |
| **NEO**    | `GET /api/neo/lookup/:id`             | Lookup asteroid       |
| **User**   | `GET /api/user/profile`               | Get profile           |
| **User**   | `PUT /api/user/profile`               | Update profile        |
| **User**   | `GET /api/user/watchlist`             | Get watchlist         |
| **User**   | `POST /api/user/watchlist`            | Add to watchlist      |
| **User**   | `DELETE /api/user/watchlist/:id`      | Remove from watchlist |
| **Alerts** | `GET /api/alerts`                     | Get alerts            |
| **Alerts** | `PUT /api/alerts/:id/read`            | Mark as read          |
| **Alerts** | `PUT /api/alerts/settings`            | Update alert settings |
| **Chat**   | `GET /api/chat/:asteroidId/messages`  | Get messages          |
| **Chat**   | `POST /api/chat/:asteroidId/messages` | Send message          |

## 📁 Project Structure

```
neo-watch-backend/
├── src/
│   ├── index.ts              # App entry point
│   ├── config/
│   │   ├── env.ts            # Environment configuration
│   │   └── database.ts       # Database connection
│   ├── db/
│   │   ├── schema/           # Drizzle schemas
│   │   │   ├── users.ts
│   │   │   ├── asteroids.ts
│   │   │   ├── watchlist.ts
│   │   │   ├── alerts.ts
│   │   │   └── messages.ts
│   │   └── index.ts          # DB client export
│   ├── routes/
│   │   ├── auth.ts           # Authentication routes
│   │   ├── neo.ts            # NEO data routes
│   │   ├── user.ts           # User & watchlist routes
│   │   ├── alerts.ts         # Alert routes
│   │   └── chat.ts           # Chat routes
│   ├── services/
│   │   ├── nasa.ts           # NASA API integration
│   │   ├── risk-engine.ts    # Risk calculation
│   │   ├── auth.ts           # Auth logic
│   │   └── alert.ts          # Alert logic
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   ├── rate-limit.ts     # Rate limiting
│   │   └── error-handler.ts  # Global error handling
│   ├── jobs/
│   │   └── sync-neo-data.ts  # Daily NEO sync cron job
│   └── utils/
│       ├── hash.ts           # Password hashing
│       └── jwt.ts            # JWT utilities
├── drizzle.config.ts         # Drizzle ORM config
├── docker-compose.yml        # PostgreSQL container
├── Dockerfile                # Production container
├── .env.example              # Environment template
└── API_DOCS.md               # API documentation
```

## 🔧 Available Scripts

| Script                | Description                              |
| --------------------- | ---------------------------------------- |
| `bun run dev`         | Start development server with hot reload |
| `bun run start`       | Start production server                  |
| `bun run db:generate` | Generate database migrations             |
| `bun run db:migrate`  | Run database migrations                  |
| `bun run db:push`     | Push schema to database                  |
| `bun run db:studio`   | Open Drizzle Studio (DB GUI)             |
| `bun run typecheck`   | Run TypeScript type checking             |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Register or login to get a token
2. Include token in Authorization header: `Bearer <token>`
3. Protected routes require valid token

```bash
# Example: Accessing protected endpoint
curl -H "Authorization: Bearer <your-token>" http://localhost:4000/api/user/profile
```

## 🌍 Risk Analysis Engine

The Risk Engine calculates a score (0-100) based on:

| Factor           | Weight | Description                  |
| ---------------- | ------ | ---------------------------- |
| Hazardous Status | 40%    | Is it potentially hazardous? |
| Miss Distance    | 30%    | How close will it pass?      |
| Size             | 20%    | How big is it?               |
| Velocity         | 10%    | How fast is it moving?       |

### Risk Levels

| Score  | Level    | Color  |
| ------ | -------- | ------ |
| 0-20   | MINIMAL  | Green  |
| 21-40  | LOW      | Blue   |
| 41-60  | MODERATE | Yellow |
| 61-80  | HIGH     | Orange |
| 81-100 | CRITICAL | Red    |

## ⚡ Rate Limiting

| Endpoint Category | Limit       |
| ----------------- | ----------- |
| Default           | 100 req/min |
| Authentication    | 20 req/min  |
| NEO Feed          | 200 req/min |

## 🐳 Docker

**Build the image:**

```bash
docker build -t neo-watch-backend .
```

**Run with Docker Compose:**

```bash
docker-compose up -d
```

## 📝 Environment Variables

| Variable            | Description                  | Default                            |
| ------------------- | ---------------------------- | ---------------------------------- |
| `PORT`              | Server port                  | `4000`                             |
| `NODE_ENV`          | Environment                  | `development`                      |
| `DATABASE_URL`      | PostgreSQL connection string | Required                           |
| `NASA_API_KEY`      | NASA API key                 | `DEMO_KEY`                         |
| `NASA_API_BASE_URL` | NASA API base URL            | `https://api.nasa.gov/neo/rest/v1` |
| `JWT_SECRET`        | JWT signing secret           | Required                           |
| `JWT_EXPIRES_IN`    | JWT expiry time              | `7d`                               |
| `FRONTEND_URL`      | Frontend URL for CORS        | `http://localhost:3000`            |

---

Part of the [Neo-Watch Project](../README.md) | Powered by NASA NeoWs API
