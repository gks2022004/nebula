# Nebula Streaming Platform - Quick Start Guide

## 🚀 Getting Started

### 1. Environment Setup

Copy the environment file and configure it:
```bash
cp .env.example .env
```

Update these critical values in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nebula"
NEXTAUTH_SECRET="generate-a-random-secret-key-here"
```

To generate a secret:
```bash
openssl rand -base64 32
```

### 2. Database Setup

Install PostgreSQL locally or use a cloud provider (Supabase, Railway, etc.)

Initialize the database:
```bash
npm run db:generate
npm run db:push
```

### 3. Start Development Servers

**Terminal 1 - Next.js Frontend:**
```bash
npm run dev
```

**Terminal 2 - Go Signaling Server:**
```bash
cd server/signaling
go mod download
go run main.go
```

Access the app at: http://localhost:3000

## 📋 Features Overview

### ✅ Implemented Features

1. **Authentication System**
   - User registration & login
   - JWT-based authentication
   - Streamer/viewer roles

2. **Live Streaming (WebRTC)**
   - Broadcaster component for streamers
   - Viewer component for watchers
   - Ultra-low latency (<1s)
   - Camera/microphone controls

3. **Real-time Chat**
   - WebSocket-based messaging
   - Chat history
   - User avatars and badges
   - Auto-reconnection

4. **User Features**
   - Follow/unfollow system
   - Smart notifications
   - User profiles

5. **Stream Management**
   - Create/edit streams
   - Start/stop broadcasting
   - Stream metadata (title, tags, category)
   - Viewer count tracking

6. **Beautiful UI**
   - Dark mode design
   - Responsive layout
   - Smooth animations
   - Glass morphism effects

## 🎯 How to Use

### As a Streamer:

1. **Register** with "I want to be a streamer" checked
2. Navigate to your **Dashboard** (coming soon in full implementation)
3. **Configure** your stream settings
4. Click **Start Broadcasting**
5. Share your stream link

### As a Viewer:

1. **Browse** streams on homepage
2. Click on a **stream card** to watch
3. **Chat** with other viewers
4. **Follow** your favorite streamers

## 🛠️ Tech Stack

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

### Real-time
- **Go** - WebRTC signaling server
- **WebRTC** - Video streaming
- **WebSocket** - Chat & signaling

## 📁 Project Structure

```
nebula/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── auth/         # Authentication
│   │   └── streams/      # Stream management
│   ├── stream/[id]/      # Stream viewing page
│   ├── browse/           # Browse streams
│   ├── login/            # Login page
│   └── register/         # Registration page
│
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── streaming/        # WebRTC components
│   ├── chat/             # Chat components
│   ├── home/             # Homepage components
│   └── layout/           # Layout components
│
├── server/               # Backend services
│   └── signaling/        # Go signaling server
│       ├── main.go       # WebRTC signaling logic
│       └── Dockerfile    # Container config
│
├── lib/                  # Utilities
│   ├── prisma.ts        # Database client
│   └── utils.ts         # Helper functions
│
├── types/               # TypeScript definitions
├── hooks/               # React hooks
└── prisma/              # Database schema
```

## 🔒 Environment Variables

Required variables:

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Signaling Server
NEXT_PUBLIC_SIGNALING_SERVER_URL="ws://localhost:8080"

# AWS S3 (optional for recordings)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="nebula-recordings"
```

## 🐳 Docker Deployment

Build the signaling server:
```bash
cd server/signaling
docker build -t nebula-signaling .
docker run -p 8080:8080 nebula-signaling
```

## 📊 Database Schema

Main tables:
- **User** - User accounts
- **Stream** - Stream metadata
- **ChatMessage** - Chat history
- **Follow** - Follow relationships
- **Notification** - User notifications
- **StreamAnalytics** - Analytics data
- **Recording** - Stream recordings

## 🎨 UI Components

Custom components built with Radix UI:
- Button
- Avatar
- Dropdown Menu
- Toast notifications
- Dialog modals

## 🔥 Next Steps

To complete the platform, you can add:
1. Streamer dashboard
2. Analytics page
3. Moderation panel
4. User profile pages
5. Search functionality
6. Stream categories
7. VOD playback
8. Monetization features

## 💡 Tips

- Keep the signaling server running while testing streams
- Use Chrome/Edge for best WebRTC support
- Test with multiple browser windows (incognito)
- Check browser console for WebRTC logs

## 🐛 Troubleshooting

**Camera not working?**
- Check browser permissions
- Ensure HTTPS (or localhost)

**Stream not connecting?**
- Verify signaling server is running
- Check WebSocket connection in DevTools

**Database errors?**
- Run `npm run db:push` again
- Check DATABASE_URL is correct

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [WebRTC Guide](https://webrtc.org/getting-started/overview)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

Built with ❤️ using Next.js, Go, and WebRTC
