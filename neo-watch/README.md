# 🌌 Neo-Watch Frontend

A modern, immersive Near-Earth Object monitoring dashboard built with Next.js 16, TypeScript, and Tailwind CSS 4.

## 🚀 Features

- **Real-time NEO Tracking** - Live data from NASA's NeoWs API
- **Risk Analysis** - Visual risk scoring and distribution charts
- **3D Orbital Visualization** - Interactive Three.js asteroid visualizations
- **Watchlist Management** - Track and manage your favorite asteroids
- **Smart Alerts** - Get notified when asteroids approach
- **Beautiful UI** - Glassmorphic "Deep Space Nebula" theme
- **Fully Responsive** - Works on desktop, tablet, and mobile

## 🎨 Design System

### Color Palette

| Color         | Variable          | Hex       |
| ------------- | ----------------- | --------- |
| Cosmic Black  | `--cosmic-black`  | `#0a0a0f` |
| Void Dark     | `--void-dark`     | `#12121a` |
| Nebula Purple | `--nebula-purple` | `#6b21a8` |
| Stellar Blue  | `--stellar-blue`  | `#0ea5e9` |
| Plasma Cyan   | `--plasma-cyan`   | `#22d3ee` |
| Danger Red    | `--danger-red`    | `#ef4444` |
| Warning Amber | `--warning-amber` | `#f59e0b` |
| Safe Green    | `--safe-green`    | `#22c55e` |

### Typography

| Font           | Variable         | Usage      |
| -------------- | ---------------- | ---------- |
| Space Grotesk  | `--font-display` | Headings   |
| Inter          | `--font-body`    | Body text  |
| JetBrains Mono | `--font-mono`    | Code, data |

### Components

- `Button` - Primary, secondary, ghost, and danger variants
- `Card` - Glassmorphic card with glow effects
- `Input` - Form input with icons and validation
- `Modal` - Animated modal dialogs
- `RiskBadge` - Color-coded risk level indicator
- `Dropdown` - Custom select components

## 📁 Project Structure

```
neo-watch/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth pages (login, register)
│   ├── (dashboard)/          # Protected dashboard pages
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # Base UI components
│   ├── layout/               # Layout components
│   ├── 3d/                   # Three.js 3D components
│   ├── asteroids/            # Asteroid-specific components
│   ├── chat/                 # Chat components
│   ├── dashboard/            # Dashboard widgets
│   └── alerts/               # Alert components
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts            # Authentication hook
│   ├── useAlerts.ts          # Alerts management
│   ├── useAsteroids.ts       # NEO data fetching
│   └── useSocket.ts          # WebSocket connection
├── context/                  # React Context providers
│   └── AuthContext.tsx       # Global auth state
├── lib/
│   ├── api.ts                # API client
│   └── orbital.ts            # Keplerian orbit calculations
├── public/                   # Static assets
│   └── textures/             # 3D textures (Sun, Earth, etc.)
└── types/                    # TypeScript types
```

## 🛠️ Getting Started

### Prerequisites

- [Bun](https://bun.sh/) v1.0+ (recommended) or Node.js 18+
- Backend server running on port 4000

### Installation

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Configure environment:**

   ```bash
   # .env.local (already pre-configured for localhost)
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   NEXT_PUBLIC_WS_URL=ws://localhost:4000
   ```

3. **Start development server:**

   ```bash
   bun run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## 📄 Available Scripts

| Script          | Description              |
| --------------- | ------------------------ |
| `bun run dev`   | Start development server |
| `bun run build` | Build for production     |
| `bun run start` | Start production server  |
| `bun run lint`  | Run ESLint               |

## 📄 Pages

| Route             | Description                                  |
| ----------------- | -------------------------------------------- |
| `/`               | Landing page with hero, features, and CTA    |
| `/login`          | User login                                   |
| `/register`       | New user registration                        |
| `/dashboard`      | Main mission control with stats and NEO list |
| `/asteroids`      | Browse and filter all asteroids              |
| `/asteroids/[id]` | Detailed asteroid profile with 3D orbit      |
| `/watchlist`      | User's tracked asteroids                     |
| `/alerts`         | Notification center                          |
| `/settings`       | User settings                                |
| `/chat/[id]`      | Asteroid discussion channel                  |

## 🔌 API Integration

All API endpoints are defined in `lib/api.ts`:

```typescript
import { neoApi, authApi, userApi, alertsApi, chatApi } from "@/lib/api";

// Fetch NEO data
const { data } = await neoApi.getFeed();

// Authentication
const { data } = await authApi.login(email, password);

// Watchlist
const { data } = await userApi.getWatchlist();

// Alerts
const { data } = await alertsApi.getAll();
```

## 🎯 Key Technologies

| Technology         | Version | Purpose                |
| ------------------ | ------- | ---------------------- |
| Next.js            | 16      | React framework        |
| React              | 19      | UI library             |
| TypeScript         | 5       | Type safety            |
| Tailwind CSS       | 4       | Styling                |
| Three.js           | 0.182   | 3D visualization       |
| @react-three/fiber | 9       | React Three.js binding |
| Framer Motion      | 12      | Animations             |
| Lucide React       | -       | Icons                  |
| Socket.io Client   | -       | Real-time updates      |

## 📱 Responsive Design

The app is fully responsive with breakpoints:

- **Mobile**: < 640px (collapsible sidebar)
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🧪 Demo Credentials

For testing without registration:

- **Email**: `test@example.com`
- **Password**: `password123`

---

Part of the [Neo-Watch Project](../README.md) | Powered by NASA NeoWs API
