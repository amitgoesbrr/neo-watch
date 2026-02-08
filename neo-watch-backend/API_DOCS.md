# Neo-Watch API Documentation

**Base URL:** `http://localhost:4000`

**API Prefix:** `/api`

---

## Table of Contents

- [Authentication](#authentication)
  - [Register](#post-apiauthregister)
  - [Login](#post-apiauthlogin)
  - [Get Current User](#get-apiauthme)
  - [Logout](#post-apiauthlogout)
- [NEO (Near-Earth Objects)](#neo-near-earth-objects)
  - [Get Today's Feed](#get-apineofeed)
  - [Get NEO Statistics](#get-apineostats)
  - [Browse All NEOs](#get-apineobrowse)
  - [Lookup Specific NEO](#get-apineolookupid)
- [User Profile & Watchlist](#user-profile--watchlist)
  - [Get Profile](#get-apiuserprofile)
  - [Update Profile](#put-apiuserprofile)
  - [Get Watchlist](#get-apiuserwatchlist)
  - [Add to Watchlist](#post-apiuserwatchlist)
  - [Update Watchlist Item](#put-apiuserwatchlistasteroidid)
  - [Remove from Watchlist](#delete-apiuserwatchlistasteroidid)
- [Alerts](#alerts)
  - [Get All Alerts](#get-apialerts)
  - [Get Unread Count](#get-apialertsunread)
  - [Mark Alert as Read](#put-apialertsidread)
  - [Mark All as Read](#put-apialertsread-all)
  - [Delete Alert](#delete-apialertsid)
- [Chat](#chat)
  - [Get Messages](#get-apichatasteroididmessages)
  - [Send Message](#post-apichatasteroididmessages)
- [Common Types](#common-types)

---

## Authentication

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <token>
```

### POST `/api/auth/register`

Register a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "fba583c4-10a3-4aff-ba22-2d433de38df8",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "avatar": null,
      "isVerified": false,
      "createdAt": "2026-02-07T10:25:19.537Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful"
}
```

**Error Response (409):**

```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

---

### POST `/api/auth/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "fba583c4-10a3-4aff-ba22-2d433de38df8",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "avatar": null,
      "isVerified": false,
      "createdAt": "2026-02-07T10:25:19.537Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### GET `/api/auth/me`

Get the currently authenticated user. **Requires authentication.**

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "fba583c4-10a3-4aff-ba22-2d433de38df8",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": "Not authenticated"
}
```

---

### POST `/api/auth/logout`

Logout the current user.

**Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## NEO (Near-Earth Objects)

### GET `/api/neo/feed`

Get today's Near-Earth Objects with risk analysis.

**Query Parameters:**

| Parameter    | Type   | Default | Description                             |
| ------------ | ------ | ------- | --------------------------------------- |
| `start_date` | string | today   | Start date (YYYY-MM-DD)                 |
| `end_date`   | string | today   | End date (YYYY-MM-DD, max 7 days range) |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "count": 18,
    "dateRange": {
      "start": "2026-02-07",
      "end": "2026-02-07"
    },
    "asteroids": [
      {
        "id": "54580776",
        "name": "(2026 CC)",
        "nasaJplUrl": "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=54580776",
        "absoluteMagnitude": 25.153,
        "estimatedDiameter": {
          "minKm": 0.0247716524,
          "maxKm": 0.0553910986,
          "minM": 24.7716523612,
          "maxM": 55.3910985946
        },
        "isPotentiallyHazardous": false,
        "isSentryObject": true,
        "closeApproachData": [
          {
            "date": "2026-02-07",
            "dateFull": "2026-Feb-07 20:06",
            "epochDate": 1770494760000,
            "velocity": {
              "kmPerSecond": 9.9563820261,
              "kmPerHour": 35842.9752938152
            },
            "missDistance": {
              "astronomical": 0.004080744,
              "lunar": 1.587409416,
              "kilometers": 610470.61041528
            },
            "orbitingBody": "Earth"
          }
        ],
        "riskScore": 29,
        "riskLevel": "LOW",
        "riskAssessment": {
          "score": 29,
          "level": "LOW",
          "factors": {
            "hazardousScore": 0,
            "distanceScore": 22.5,
            "sizeScore": 4,
            "velocityScore": 2.5
          }
        }
      }
    ]
  }
}
```

---

### GET `/api/neo/stats`

Get statistics about today's Near-Earth Objects.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "totalCount": 18,
    "hazardousCount": 0,
    "closestApproach": {
      "asteroid": {
        "id": "54580776",
        "name": "(2026 CC)",
        "riskScore": 29,
        "riskLevel": "LOW",
        "estimatedDiameter": {
          "minKm": 0.0247716524,
          "maxKm": 0.0553910986
        },
        "closeApproachData": [...]
      },
      "distanceKm": 610470.61041528
    },
    "largestAsteroid": {
      "id": "3799250",
      "name": "(2018 CE1)",
      "estimatedDiameter": {
        "minKm": 0.163137941,
        "maxKm": 0.3647875257
      },
      "riskScore": 15,
      "riskLevel": "MINIMAL"
    },
    "fastestAsteroid": {
      "id": "54122968",
      "name": "(2021 DE)",
      "closeApproachData": [{
        "velocity": {
          "kmPerSecond": 41.1859941756,
          "kmPerHour": 148269.5790319861
        }
      }],
      "riskScore": 15,
      "riskLevel": "MINIMAL"
    },
    "riskDistribution": {
      "CRITICAL": 0,
      "HIGH": 0,
      "MODERATE": 0,
      "LOW": 1,
      "MINIMAL": 17
    }
  }
}
```

---

### GET `/api/neo/browse`

Browse all known Near-Earth Objects (paginated).

**Query Parameters:**

| Parameter | Type   | Default | Description             |
| --------- | ------ | ------- | ----------------------- |
| `page`    | number | 0       | Page number (0-indexed) |
| `size`    | number | 20      | Items per page          |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "asteroids": [
      {
        "id": "2000433",
        "name": "433 Eros (A898 PA)",
        "nasaJplUrl": "https://ssd.jpl.nasa.gov/...",
        "absoluteMagnitude": 10.31,
        "estimatedDiameter": {
          "minKm": 22.1082,
          "maxKm": 49.435
        },
        "isPotentiallyHazardous": true,
        "isSentryObject": false
      }
    ],
    "page": {
      "size": 20,
      "total_elements": 37238,
      "total_pages": 1862,
      "number": 0
    }
  }
}
```

---

### GET `/api/neo/lookup/:id`

Get detailed information about a specific asteroid.

**URL Parameters:**

| Parameter | Type   | Description                         |
| --------- | ------ | ----------------------------------- |
| `id`      | string | NASA asteroid ID (neo_reference_id) |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "asteroid": {
      "id": "54580776",
      "name": "(2026 CC)",
      "nasaJplUrl": "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=54580776",
      "absoluteMagnitude": 25.153,
      "estimatedDiameter": {
        "minKm": 0.0247716524,
        "maxKm": 0.0553910986,
        "minM": 24.7716523612,
        "maxM": 55.3910985946
      },
      "isPotentiallyHazardous": false,
      "isSentryObject": true,
      "closeApproachData": [
        {
          "date": "2026-02-07",
          "dateFull": "2026-Feb-07 20:06",
          "epochDate": 1770494760000,
          "velocity": {
            "kmPerSecond": 9.9563820261,
            "kmPerHour": 35842.9752938152
          },
          "missDistance": {
            "astronomical": 0.004080744,
            "lunar": 1.587409416,
            "kilometers": 610470.61041528
          },
          "orbitingBody": "Earth"
        }
      ],
      "orbitalData": {
        "orbitId": "7",
        "orbitDeterminationDate": "2026-02-07",
        "eccentricity": "0.1234",
        "inclination": "5.678",
        "semiMajorAxis": "1.234"
      },
      "riskScore": 29,
      "riskLevel": "LOW",
      "riskAssessment": {
        "score": 29,
        "level": "LOW",
        "factors": {
          "hazardousScore": 0,
          "distanceScore": 22.5,
          "sizeScore": 4,
          "velocityScore": 2.5
        }
      }
    }
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Asteroid not found"
}
```

---

## User Profile & Watchlist

All endpoints require authentication.

### GET `/api/user/profile`

Get the current user's full profile.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "fba583c4-10a3-4aff-ba22-2d433de38df8",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "avatar": "https://example.com/avatar.jpg",
      "isVerified": true,
      "createdAt": "2026-02-07T10:25:19.537Z"
    }
  }
}
```

---

### PUT `/api/user/profile`

Update the current user's profile.

**Request Body:**

```json
{
  "name": "John Updated",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "fba583c4-10a3-4aff-ba22-2d433de38df8",
      "email": "user@example.com",
      "name": "John Updated",
      "role": "user",
      "avatar": "https://example.com/new-avatar.jpg",
      "isVerified": true,
      "createdAt": "2026-02-07T10:25:19.537Z"
    }
  },
  "message": "Profile updated successfully"
}
```

---

### GET `/api/user/watchlist`

Get the user's asteroid watchlist.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "count": 2,
    "items": [
      {
        "id": "a1b2c3d4-...",
        "userId": "fba583c4-...",
        "asteroidId": "54580776",
        "nickname": "Close One",
        "notes": "Watching closely due to proximity",
        "alertEnabled": true,
        "alertThresholdKm": 1000000,
        "createdAt": "2026-02-07T11:00:00.000Z",
        "asteroid": {
          "id": "54580776",
          "name": "(2026 CC)",
          "riskScore": 29,
          "riskLevel": "LOW",
          "estimatedDiameter": {...},
          "closeApproachData": [...]
        }
      }
    ]
  }
}
```

---

### POST `/api/user/watchlist`

Add an asteroid to the watchlist.

**Request Body:**

```json
{
  "asteroidId": "54580776",
  "nickname": "Close One",
  "notes": "Watching closely",
  "alertEnabled": true,
  "alertThresholdKm": 1000000
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "item": {
      "id": "a1b2c3d4-...",
      "userId": "fba583c4-...",
      "asteroidId": "54580776",
      "nickname": "Close One",
      "notes": "Watching closely",
      "alertEnabled": true,
      "alertThresholdKm": 1000000,
      "createdAt": "2026-02-07T11:00:00.000Z"
    },
    "asteroid": {
      "id": "54580776",
      "name": "(2026 CC)",
      "riskScore": 29,
      "riskLevel": "LOW"
    }
  },
  "message": "Added to watchlist"
}
```

**Error Response (409):**

```json
{
  "success": false,
  "error": "Asteroid already in watchlist"
}
```

---

### PUT `/api/user/watchlist/:asteroidId`

Update a watchlist item.

**URL Parameters:**

| Parameter    | Type   | Description      |
| ------------ | ------ | ---------------- |
| `asteroidId` | string | NASA asteroid ID |

**Request Body:**

```json
{
  "nickname": "Updated Name",
  "notes": "Updated notes",
  "alertEnabled": false,
  "alertThresholdKm": 500000
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "item": {
      "id": "a1b2c3d4-...",
      "asteroidId": "54580776",
      "nickname": "Updated Name",
      "alertEnabled": false,
      "alertThresholdKm": 500000
    }
  },
  "message": "Watchlist item updated"
}
```

---

### DELETE `/api/user/watchlist/:asteroidId`

Remove an asteroid from the watchlist.

**URL Parameters:**

| Parameter    | Type   | Description      |
| ------------ | ------ | ---------------- |
| `asteroidId` | string | NASA asteroid ID |

**Response (200):**

```json
{
  "success": true,
  "message": "Removed from watchlist"
}
```

---

## Alerts

All endpoints require authentication.

### GET `/api/alerts`

Get all alerts for the current user.

**Query Parameters:**

| Parameter | Type   | Default | Description              |
| --------- | ------ | ------- | ------------------------ |
| `limit`   | number | 50      | Maximum alerts to return |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "count": 3,
    "alerts": [
      {
        "id": "alert-uuid-1",
        "userId": "user-uuid",
        "asteroidId": "54580776",
        "type": "close_approach",
        "title": "Close Approach Alert",
        "message": "Asteroid (2026 CC) will pass within 1,000,000 km",
        "isRead": false,
        "scheduledFor": null,
        "sentAt": "2026-02-07T10:00:00.000Z",
        "createdAt": "2026-02-07T10:00:00.000Z"
      }
    ]
  }
}
```

---

### GET `/api/alerts/unread`

Get the count of unread alerts.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

### PUT `/api/alerts/:id/read`

Mark a specific alert as read.

**URL Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Alert UUID  |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "alert": {
      "id": "alert-uuid-1",
      "isRead": true
    }
  }
}
```

---

### PUT `/api/alerts/read-all`

Mark all alerts as read.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "markedCount": 5
  },
  "message": "Marked 5 alerts as read"
}
```

---

### DELETE `/api/alerts/:id`

Delete an alert.

**URL Parameters:**

| Parameter | Type   | Description |
| --------- | ------ | ----------- |
| `id`      | string | Alert UUID  |

**Response (200):**

```json
{
  "success": true,
  "message": "Alert deleted"
}
```

---

## Chat

### GET `/api/chat/:asteroidId/messages`

Get chat messages for a specific asteroid discussion.

**URL Parameters:**

| Parameter    | Type   | Description      |
| ------------ | ------ | ---------------- |
| `asteroidId` | string | NASA asteroid ID |

**Query Parameters:**

| Parameter | Type   | Default | Description                |
| --------- | ------ | ------- | -------------------------- |
| `limit`   | number | 50      | Maximum messages to return |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "asteroidId": "54580776",
    "count": 2,
    "messages": [
      {
        "id": "message-uuid-1",
        "content": "This asteroid is getting really close!",
        "createdAt": "2026-02-07T10:00:00.000Z",
        "user": {
          "id": "user-uuid",
          "name": "John Doe",
          "avatar": "https://example.com/avatar.jpg"
        }
      },
      {
        "id": "message-uuid-2",
        "content": "The risk score seems accurate",
        "createdAt": "2026-02-07T10:05:00.000Z",
        "user": {
          "id": "user-uuid-2",
          "name": "Jane Smith",
          "avatar": null
        }
      }
    ]
  }
}
```

---

### POST `/api/chat/:asteroidId/messages`

Send a message in an asteroid chat. **Requires authentication.**

**URL Parameters:**

| Parameter    | Type   | Description      |
| ------------ | ------ | ---------------- |
| `asteroidId` | string | NASA asteroid ID |

**Request Body:**

```json
{
  "content": "This is my message about the asteroid"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "message": {
      "id": "message-uuid-new",
      "content": "This is my message about the asteroid",
      "createdAt": "2026-02-07T10:10:00.000Z",
      "user": {
        "id": "user-uuid",
        "name": "John Doe"
      }
    }
  }
}
```

---

## Common Types

### Risk Levels

| Level      | Score Range | Color  |
| ---------- | ----------- | ------ |
| `MINIMAL`  | 0-20        | Green  |
| `LOW`      | 21-40       | Blue   |
| `MODERATE` | 41-60       | Yellow |
| `HIGH`     | 61-80       | Orange |
| `CRITICAL` | 81-100      | Red    |

### Alert Types

| Type               | Description                           |
| ------------------ | ------------------------------------- |
| `close_approach`   | Asteroid approaching within threshold |
| `hazard_update`    | Hazard status changed                 |
| `watchlist_update` | Watched asteroid data updated         |
| `system`           | System notifications                  |

### User Roles

| Role         | Description     |
| ------------ | --------------- |
| `user`       | Standard user   |
| `researcher` | Research access |
| `admin`      | Administrator   |

### API Response Format

All API responses follow this structure:

**Success:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error:**

```json
{
  "success": false,
  "error": "Error message description"
}
```

---

## Error Codes

| Status Code | Description                            |
| ----------- | -------------------------------------- |
| 200         | Success                                |
| 201         | Created                                |
| 400         | Bad Request - Invalid input            |
| 401         | Unauthorized - Authentication required |
| 404         | Not Found                              |
| 409         | Conflict - Resource already exists     |
| 429         | Too Many Requests - Rate limited       |
| 500         | Internal Server Error                  |

---

## TypeScript Types

For frontend development, here are the main TypeScript types:

```typescript
// User Types
interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "researcher" | "admin";
  avatar: string | null;
  isVerified: boolean;
  createdAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

// NEO Types
interface NEO {
  id: string;
  name: string;
  nasaJplUrl: string;
  absoluteMagnitude: number;
  estimatedDiameter: {
    minKm: number;
    maxKm: number;
    minM: number;
    maxM: number;
  };
  isPotentiallyHazardous: boolean;
  isSentryObject: boolean;
  closeApproachData: CloseApproach[];
  orbitalData?: OrbitalData;
  riskScore: number;
  riskLevel: RiskLevel;
  riskAssessment: RiskAssessment;
}

interface CloseApproach {
  date: string;
  dateFull: string;
  epochDate: number;
  velocity: {
    kmPerSecond: number;
    kmPerHour: number;
  };
  missDistance: {
    astronomical: number;
    lunar: number;
    kilometers: number;
  };
  orbitingBody: string;
}

type RiskLevel = "MINIMAL" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

interface RiskAssessment {
  score: number;
  level: RiskLevel;
  factors: {
    hazardousScore: number;
    distanceScore: number;
    sizeScore: number;
    velocityScore: number;
  };
}

// Watchlist Types
interface WatchlistItem {
  id: string;
  userId: string;
  asteroidId: string;
  nickname: string | null;
  notes: string | null;
  alertEnabled: boolean;
  alertThresholdKm: number;
  createdAt: string;
  asteroid?: NEO;
}

// Alert Types
interface Alert {
  id: string;
  userId: string;
  asteroidId: string | null;
  type: "close_approach" | "hazard_update" | "watchlist_update" | "system";
  title: string;
  message: string;
  isRead: boolean;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
}

// Chat Types
interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  page: {
    size: number;
    total_elements: number;
    total_pages: number;
    number: number;
  };
}
```

---

## Example API Client (Frontend)

```typescript
const API_BASE = "http://localhost:4000/api";

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  return response.json();
}

// Usage examples:
const login = (email: string, password: string) =>
  apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

const getNeoFeed = () =>
  apiRequest<{ count: number; asteroids: NEO[] }>("/neo/feed");

const getWatchlist = () =>
  apiRequest<{ count: number; items: WatchlistItem[] }>("/user/watchlist");
```
