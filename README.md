# CodeEscape — Full-Stack Cyberpunk Coding Escape Room

A gamified learning platform with three challenge tracks (Coding, Aptitude, English),
real accounts backed by MongoDB Atlas, JWT auth, a persistent leaderboard, and
real-time multiplayer rooms over Socket.IO. Modern glassmorphic cyberpunk UI with a
live Three.js/React Three Fiber 3D backdrop.

```
codeescape/
  frontend/   React + Vite client (port 5173)
  backend/    Express + MongoDB Atlas + Socket.IO API (port 5000)
```

## 1. Prerequisites
- Node.js 18+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) cluster

## 2. Set up MongoDB Atlas
1. Create a free cluster (M0) at cloud.mongodb.com.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add your IP (or `0.0.0.0/0` for quick local testing).
4. **Database → Connect → Drivers** → copy the connection string, e.g.
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

## 3. Configure the backend
```bash
cd backend
cp .env.example .env
```
Edit `backend/.env` and paste your connection string into `MONGODB_URI`. Also set a
random `JWT_SECRET` (any long random string).

## 4. Install & Run

Install all dependencies:

```bash
npm run install:all
```

If you get:

```text
'concurrently' is not recognized as an internal or external command
```

Run:

```bash
npm install -D concurrently
cd backend && npm install
cd ../frontend && npm install
cd ..
```

Start the project:

```bash
npm run dev
```

> **Note:** Make sure your database is running and connected.

Or run them separately:

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

The frontend is already configured to use `http://localhost:5000/api`. Update `frontend/.env` if your backend runs elsewhere.

Optional:

```bash
npm run seed
```

## 5. What's implemented

### Backend (`/backend`)
- **Express 5 API** with rate limiting, CORS, and structured error handling.
- **MongoDB Atlas via Mongoose** — `User`, `GameState`, `Room` collections.
- **Auth**: signup (email or phone) → OTP verification (demo mode: OTP is echoed
  back in the API response so no SMS/email provider is required) → profile setup →
  JWT issued. Also plain login and guest login. Passwords hashed with bcrypt.
- **Game state persistence**: score, solved count, accuracy, per-language stats,
  level/quiz completion, all stored per-user and synced from the frontend.
- **Leaderboard**: real top-scores query across all users.
- **Real-time multiplayer rooms** via Socket.IO: JWT-authenticated sockets, room
  join/leave, live chat, live score sync, host-triggered game start — all persisted
  to the `Room` collection.

### Frontend (`/frontend`)
- Modern glassmorphic **cyberpunk UI** (neon green / electric blue / alarm red),
  Sora + Inter type, soft glow and blur instead of retro pixel styling.
- Live **3D backdrop** (Three.js / React Three Fiber): shader grid horizon, drifting
  wireframe polyhedra, particles, a rotating core, and 3D puzzle-object icons.
- Fully wired to the backend: every auth step, game action, and leaderboard/room
  view goes through the real API — no mocked data.

## 6. API overview
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | Start signup, returns demo OTP |
| POST | `/api/auth/verify-otp` | Verify OTP, returns a short-lived setup token |
| POST | `/api/auth/profile-setup` | Finish profile, returns JWT |
| POST | `/api/auth/login` | Email/phone + password login |
| POST | `/api/auth/guest` | Instant guest account |
| GET  | `/api/auth/me` | Current user + game state |
| GET/PUT | `/api/game/state` | Read/persist game progress |
| GET | `/api/leaderboard` | Top scores |
| POST | `/api/rooms` | Create a multiplayer room |
| POST | `/api/rooms/:code/join` | Join a room (REST fallback; sockets do this live) |

Socket.IO events: `room:join`, `room:chat`, `room:score`, `room:start` (client →
server) and `room:state`, `room:chat`, `room:toast`, `room:started`, `room:error`
(server → client).

## 7. Notes & next steps
- Code "execution" is simulated (pattern-matched validation), same scope as the
  original prototype — swapping in a real sandboxed code runner is the natural next
  step.
- OTP is returned directly in the API response for demo purposes. For production,
  wire `backend/src/routes/auth.routes.js` to a real email/SMS provider (e.g.
  SendGrid, Twilio) and stop echoing the code back to the client.
