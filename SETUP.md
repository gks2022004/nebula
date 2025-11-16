# Nebula - Live Streaming Platform

A scalable, ultra-low-latency live streaming platform built with Next.js, Go, and WebRTC.

## 🚀 Features

- **Live Video Streaming**: WebRTC-based ultra-low-latency streaming (<1s)
- **Real-Time Chat**: Interactive chat rooms with WebSocket
- **User System**: Authentication, profiles, follow system
- **Live Analytics**: Real-time viewer counts and engagement metrics
- **Moderation Tools**: Chat moderation, rate limiting, logging
- **Stream Recording**: Automatic recording with S3 storage
- **Smart Notifications**: Followers notified when streamers go live
- **Beautiful UI**: Modern, responsive design with Tailwind CSS and Framer Motion

## 🏗️ Architecture

### Frontend (Next.js 14)
- **App Router** with React Server Components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **NextAuth.js** for authentication
- **TanStack Query** for data fetching
- **Zustand** for state management

### Backend Services
- **Next.js API Routes** (Node.js) for REST APIs
- **Go Signaling Server** for WebRTC connections
- **PostgreSQL** with Prisma ORM
- **AWS S3** for stream recordings

### Real-Time Features
- **WebRTC** for peer-to-peer video streaming
- **WebSocket** for chat and signaling
- **Go WebSocket Server** for high-performance signaling

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Go 1.21+
- AWS Account (for S3 storage)

### Setup Steps

1. **Install Node.js dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random secret for NextAuth
- AWS credentials for S3
- Other configuration

3. **Set up the database**
```bash
npm run db:generate
npm run db:push
```

4. **Start the development server**
```bash
npm run dev
```

5. **Start the Go signaling server** (in a new terminal)
```bash
npm run signaling
```

The app will be available at `http://localhost:3000`
The signaling server runs on `http://localhost:8080`

## 🎯 Usage

### For Streamers
1. Register an account and enable streamer mode
2. Go to your dashboard
3. Configure stream settings
4. Click "Start Broadcasting"
5. Share your stream link with viewers

### For Viewers
1. Browse live streams on the homepage
2. Click on a stream to watch
3. Chat with other viewers in real-time
4. Follow your favorite streamers

## 🛠️ Development

### Project Structure
```
nebula/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (routes)/          # Page routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI components
│   ├── streaming/        # WebRTC components
│   ├── chat/             # Chat components
│   └── layout/           # Layout components
├── lib/                   # Utility functions
├── prisma/               # Database schema
├── server/               # Backend services
│   └── signaling/        # Go signaling server
├── types/                # TypeScript types
└── hooks/                # React hooks
```

### Key Technologies
- **WebRTC**: Ultra-low-latency video streaming
- **WebSocket**: Real-time bidirectional communication
- **Prisma**: Type-safe database ORM
- **NextAuth.js**: Authentication
- **Tailwind CSS**: Utility-first CSS framework

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Streams
- `GET /api/streams` - List all streams
- `GET /api/streams/:id` - Get stream details
- `POST /api/streams` - Create new stream
- `PATCH /api/streams/:id` - Update stream
- `POST /api/streams/:id/start` - Start stream
- `POST /api/streams/:id/stop` - Stop stream

### Users
- `POST /api/users/:userId/follow` - Follow user
- `DELETE /api/users/:userId/follow` - Unfollow user

### Chat
- `GET /api/streams/:id/chat` - Get chat history

## 🔐 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on chat
- Input validation and sanitization
- CORS configuration
- Secure WebSocket connections

## 🎨 UI Components
Built with Radix UI primitives:
- Avatar
- Button
- Dropdown Menu
- Toast notifications
- Dialog
- Tabs

## 📊 Database Schema
See `prisma/schema.prisma` for the complete database schema including:
- Users
- Streams
- Chat Messages
- Follows
- Notifications
- Analytics
- Recordings

## 🚀 Deployment

### Frontend (Vercel)
```bash
vercel deploy
```

### Database (Railway/Supabase)
Configure your PostgreSQL instance and update `DATABASE_URL`

### Go Server (Docker/AWS)
```bash
cd server/signaling
docker build -t nebula-signaling .
docker run -p 8080:8080 nebula-signaling
```

## 📄 License
MIT License

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
