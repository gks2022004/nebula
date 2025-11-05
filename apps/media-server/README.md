# Nebula Media Server

WebRTC media server built with Go and Pion.

## Setup

```bash
# Download dependencies
go mod download

# Run the server
go run cmd/server/main.go

# Build binary
go build -o bin/media-server cmd/server/main.go
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
PORT=8080
REDIS_HOST=localhost:6379
AWS_REGION=us-east-1
S3_BUCKET=nebula-recordings
```

## Development

The Go modules need to be downloaded first. Run:

```bash
cd apps/media-server
go mod download
go mod tidy
```

Then start the server:

```bash
go run cmd/server/main.go
```
