# 🌌 Neo-Watch: Interstellar Asteroid Tracker & Risk Analyser

> A Full-Stack Platform for Real-Time Near-Earth Object (NEO) Monitoring

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend: Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black)](https://nextjs.org/)
[![Backend: Elysia](https://img.shields.io/badge/Backend-Elysia-purple)](https://elysiajs.com/)
[![Database: PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)](https://www.postgresql.org/)

---

## 🚀 Overview

Neo-Watch is a comprehensive monitoring platform that fetches live asteroid data from NASA's NeoWs API. It provides real-time tracking, risk analysis, personalized watchlists, and community discussion features.

### Key Features

- **Real-Time NEO Tracking** - Live data from NASA's Near Earth Object Web Service
- **Risk Analysis Engine** - AI-powered risk scoring based on size, velocity, and proximity
- **3D Orbital Visualization** - Interactive Three.js visualizations of asteroid orbits
- **Personalized Watchlists** - Track your favorite asteroids with custom alerts
- **Smart Alerts** - Get notified when asteroids approach within your threshold
- **Community Chat** - Discuss asteroids with other space enthusiasts
- **Beautiful UI** - Glassmorphic "Deep Space Nebula" design theme

---

## 🛠️ Tech Stack

### Frontend (`neo-watch/`)

| Technology         | Purpose                      |
| ------------------ | ---------------------------- |
| **Next.js 16**     | React framework (App Router) |
| **React 19**       | UI library                   |
| **Tailwind CSS 4** | Styling framework            |
| **Three.js**       | 3D orbital visualization     |
| **Framer Motion**  | Animations                   |
| **Socket.io**      | Real-time communication      |

### Backend (`neo-watch-backend/`)

| Technology      | Purpose                   |
| --------------- | ------------------------- |
| **Bun**         | JavaScript runtime        |
| **Elysia**      | Backend framework         |
| **PostgreSQL**  | Primary database          |
| **Drizzle ORM** | Type-safe database ORM    |
| **JWT**         | Authentication tokens     |
| **Node-Cron**   | Background job scheduling |

### DevOps

| Technology         | Purpose                       |
| ------------------ | ----------------------------- |
| **Docker**         | Containerization              |
| **Docker Compose** | Multi-container orchestration |

---

## 📁 Project Structure

```
neo-watch/                    # Frontend (Next.js 16)
├── app/                      # App Router pages
│   ├── (auth)/               # Login, Register
│   ├── (dashboard)/          # Dashboard, Asteroids, Chat, etc.
│   └── page.tsx              # Landing page
├── components/               # UI components
│   ├── ui/                   # Base components (Button, Modal, etc.)
│   ├── layout/               # Layout components (StarField, Sidebar)
│   ├── asteroids/            # Asteroid-specific components
│   ├── 3d/                   # Three.js 3D components
│   ├── chat/                 # Chat components
│   └── alerts/               # Alert components
├── hooks/                    # Custom React hooks
├── context/                  # React Context providers
├── lib/                      # Utilities and API client
└── Dockerfile

neo-watch-backend/            # Backend (Elysia + Bun)
├── src/
│   ├── routes/               # API routes
│   ├── services/             # Business logic
│   ├── middleware/           # Auth, Rate limiting, Error handling
│   ├── db/                   # Drizzle schema & migrations
│   ├── jobs/                 # Cron jobs
│   └── config/               # Environment config
└── Dockerfile

docs/                         # Project documentation
├── reference/                # Original requirements

postman/                      # API testing collection

docker-compose.yml            # Full-stack orchestration
```

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) v1.0+
- [PostgreSQL](https://www.postgresql.org/) 14+
- [Docker](https://www.docker.com/) (optional)
- NASA API Key (free at [api.nasa.gov](https://api.nasa.gov/))

### Development Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd neo-watch
   ```

2. **Start the database:**

   ```bash
   cd neo-watch-backend
   docker-compose up -d  # Starts PostgreSQL
   ```

3. **Configure environment:**

   ```bash
   # Backend
   cd neo-watch-backend
   cp .env.example .env
   # Edit .env with your NASA_API_KEY and JWT_SECRET

   # Frontend
   cd ../neo-watch
   # .env.local is pre-configured for localhost
   ```

4. **Install dependencies and run migrations:**

   ```bash
   # Backend
   cd neo-watch-backend
   bun install
   bun run db:push

   # Frontend
   cd ../neo-watch
   bun install
   ```

5. **Start development servers:**

   ```bash
   # Terminal 1 - Backend
   cd neo-watch-backend && bun run dev

   # Terminal 2 - Frontend
   cd neo-watch && bun run dev
   ```

6. **Open the app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Docs (Swagger): http://localhost:4000/docs

### Production (Docker)

```bash
# From project root
docker-compose up -d

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:4000
# - API Docs: http://localhost:4000/docs
```

---

## 📚 Documentation

- **[Frontend README](./neo-watch/README.md)** - Frontend setup and details
- **[Backend README](./neo-watch-backend/README.md)** - Backend setup and details
- **[API Documentation](./neo-watch-backend/API_DOCS.md)** - Full API reference
- **[Postman Collection](./postman/)** - API testing collection

---

## 🧪 Demo Credentials

For testing without registration:

- **Email:** `test@example.com`
- **Password:** `password123`

---

## 📊 Risk Analysis Engine

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
| 41-60  | MODERATE | Amber  |
| 61-80  | HIGH     | Orange |
| 81-100 | CRITICAL | Red    |

---

## 🎨 Design Theme

**"Deep Space Nebula"** - A dark, immersive space-themed design featuring:

- Glassmorphic UI components with blur effects
- Cosmic color palette (purples, cyans, deep blacks)
- Animated star field backgrounds
- 3D orbital visualizations with post-processing effects
- Smooth micro-animations and transitions

---

## 📄 License

MIT License - feel free to use this project as a template!

---

Built with 💜 by the Neo-Watch Team | Powered by NASA NeoWs API
