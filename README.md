# Nebula - Modern Real-Time Live Streaming Platform

A scalable, ultra-low-latency live streaming platform built with a hybrid architecture combining the best of TypeScript, Go, and Python.

## Quick Links

- **[Quick Start Guide](QUICKSTART.md)** - Get started in minutes
- **[Quick Reference](QUICKREF.md)** - Common commands and URLs
- **[Status Report](STATUS.md)** - What's fixed and troubleshooting
- **[Summary](SUMMARY.md)** - Complete fix summary
- **[Architecture](docs/ARCHITECTURE.md)** - System design
- **[Development Guide](docs/DEVELOPMENT.md)** - Detailed workflows

## Features

- **Live Video Streaming**: WebRTC-based ultra-low-latency streaming
- **Real-Time Chat**: Interactive chat rooms with WebSocket
- **User System**: Authentication, profiles, follow system
- **Live Analytics**: Real-time viewer counts and engagement metrics
- **Moderation Tools**: Chat moderation, rate limiting, logging
- **Stream Recording**: Automatic recording with S3 storage
- **Smart Notifications**: Followers notified when streamers go live

## Architecture

```
┌─────────────────────────────── Frontend (Next.js) ───────────────────────────────┐
                                          |
                                          ▼
                                  API Gateway / REST
                                          |
               ┌──────────────────────────────────────────────────────┐
               |                  Nest.js Backend                     |
               |------------------------------------------------------|
               | Auth | Streams | Chat WS | Workers | Moderation      |
               └────────────┬─────────────────┬────────────────────--─┘
                            |                 |
                            ▼                 ▼
                    PostgreSQL            Redis (PubSub + Cache)
                            |                 |
                            ▼                 ▼
                    ┌──────────────────┐  ┌─────────────────┐
                    │ Go Media Server  │◀─│ Redis PubSub    │
                    │ (WebRTC SFU)     │  └─────────────────┘
                    └──────────────────┘
                            |
                            ▼
                    AWS S3 (Recordings)
                            |
                            ▼
                    CloudFront CDN
```

## Tech Stack

| Component      | Technology                 |
| -------------- | -------------------------- |
| Backend API    | TypeScript, Nest.js        |
| Media Server   | Go, Pion WebRTC            |
| Frontend       | Next.js, React, TypeScript |
| Database       | PostgreSQL with Prisma ORM |
| Cache & PubSub | Redis                      |
| Message Queue  | BullMQ                     |
| Storage        | AWS S3                     |
| CDN            | AWS CloudFront             |
| Real-Time      | WebSocket, WebRTC          |
| Container      | Docker, Docker Compose     |

## 🛠️ Project Structure

```
nebula/
├── apps/
│   ├── backend/          # Nest.js REST API + WebSocket + Workers
│   ├── frontend/         # Next.js React application
│   └── media-server/     # Go WebRTC media server
├── packages/
│   └── shared/           # Shared types and utilities
├── docker-compose.yml    # Local development environment
└── package.json          # Monorepo workspace configuration
```

## Quick Start

### Prerequisites

- Node.js 18+
- Go 1.21+
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/nebula.git
   cd nebula
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start infrastructure (PostgreSQL + Redis)**

   ```bash
   npm run docker:up
   ```

4. **Setup database**

   ```bash
   npm run prisma:migrate
   ```

5. **Start all services**

   **Terminal 1 - Backend:**

   ```bash
   npm run dev:backend
   ```

   **Terminal 2 - Frontend:**

   ```bash
   npm run dev:frontend
   ```

   **Terminal 3 - Media Server:**

   ```bash
   npm run dev:media
   ```

6. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Media Server: http://localhost:8080
   - Prisma Studio: `npm run prisma:studio`

## 📝 Available Scripts

### Development

- `npm run dev:backend` - Start Nest.js backend in development mode
- `npm run dev:frontend` - Start Next.js frontend in development mode
- `npm run dev:media` - Start Go media server in development mode

### Database

- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Docker

- `npm run docker:up` - Start all Docker services
- `npm run docker:down` - Stop all Docker services
- `npm run docker:logs` - View Docker logs

### Build

- `npm run build:backend` - Build backend for production
- `npm run build:frontend` - Build frontend for production
- `npm run build:media` - Build Go media server

## 🗺️ Development Roadmap

- [x] **Phase 1**: Monorepo setup, Docker, infrastructure
- [ ] **Phase 2**: Auth system (JWT, signup/login)
- [ ] **Phase 3**: Go Live flow (WebRTC streaming)
- [ ] **Phase 4**: Watch stream (WebRTC playback)
- [ ] **Phase 5**: Real-time chat (WebSocket + Redis)
- [ ] **Phase 6**: Workers & notifications (BullMQ)
- [ ] **Phase 7**: Recording & archive (S3 storage)
- [ ] **Phase 8**: Observability & scaling (Grafana, Prometheus)

## 🔧 Environment Variables

Create `.env` files in each service directory:

### Backend (`apps/backend/.env`)

```env
DATABASE_URL=postgresql://nebula:nebula_dev_password@localhost:5432/nebula_streaming
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
MEDIA_SERVER_URL=http://localhost:8080
AWS_REGION=us-east-1
S3_BUCKET=nebula-recordings
```

### Frontend (`apps/frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_MEDIA_SERVER_URL=http://localhost:8080
```


