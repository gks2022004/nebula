# Nebula - Live Streaming Platform

> A scalable, ultra-low-latency live streaming platform built with Next.js, Go, and WebRTC

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Go](https://img.shields.io/badge/Go-1.21-00ADD8?style=flat-square&logo=go)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-336791?style=flat-square&logo=postgresql)

## Features

- **Ultra-Low Latency Streaming** - WebRTC-based streaming with <1s delay
- **Real-Time Chat** - Interactive chat rooms with WebSocket
- **User System** - Authentication, profiles, and follow system
- **Live Analytics** - Real-time viewer counts and engagement metrics
- **Moderation Tools** - Chat moderation and user management
- **Stream Recording** - Automatic recording with S3 storage
- **Smart Notifications** - Followers notified when streamers go live
- **Beautiful UI** - Modern, responsive design with animations

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Go 1.21+

### Installation

```bash
# Run the automated setup script
./setup.sh

# Or manually:
npm install
cp .env.example .env
npm run db:generate
npm run db:push
```

### Development

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Signaling Server:**
```bash
npm run signaling
```

Open [http://localhost:3000](http://localhost:3000) 

## Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Complete project overview

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Radix UI** - Accessible components

### Backend
- **Next.js API Routes** - REST API
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **NextAuth.js** - Authentication

### Real-Time
- **Go** - High-performance signaling server
- **WebRTC** - Video streaming
- **WebSocket** - Chat and signaling

## �� Project Structure

```
nebula/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── stream/[id]/       # Stream viewing page
│   ├── browse/            # Browse streams
│   └── login/             # Authentication pages
├── components/            # React components
│   ├── streaming/         # WebRTC components
│   ├── chat/              # Real-time chat
│   └── ui/                # UI components
├── server/                # Backend services
│   └── signaling/         # Go WebRTC server
├── lib/                   # Utilities
├── prisma/                # Database schema
└── types/                 # TypeScript definitions
```

## Key Features Explained

### Live Streaming
- Broadcaster component with camera/mic controls
- Viewer component with fullscreen support
- WebRTC peer connections
- STUN/TURN server support

### Real-Time Chat
- WebSocket-based messaging
- Chat history persistence
- User badges (moderator, etc.)
- Auto-reconnection

### User System
- Email/password authentication
- Streamer/viewer roles
- Follow/unfollow functionality
- Profile management

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
npm run signaling    # Start Go signaling server
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Streams
- `GET /api/streams` - List streams
- `POST /api/streams` - Create stream
- `GET /api/streams/:id` - Get stream details
- `POST /api/streams/:id/start` - Start streaming
- `POST /api/streams/:id/stop` - Stop streaming
- `GET /api/streams/:id/chat` - Get chat history

### Social
- `POST /api/users/:userId/follow` - Follow user
- `DELETE /api/users/:userId/follow` - Unfollow user

## 🐳 Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Signaling Server (Docker)
```bash
cd server/signaling
docker build -t nebula-signaling .
docker run -p 8080:8080 nebula-signaling
```

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/nebula"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SIGNALING_SERVER_URL="ws://localhost:8080"
```

See `.env.example` for all available variables.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


