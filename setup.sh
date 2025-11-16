#!/bin/bash

echo "Nebula - Live Streaming Platform Setup"
echo "=========================================="
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
echo "Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "npm is not installed."
    exit 1
fi
echo "npm $(npm --version)"

# Check Go
if ! command -v go &> /dev/null; then
    echo "Go is not installed. You'll need it to run the signaling server."
    echo "   Download from: https://go.dev/dl/"
else
    echo "Go $(go version | awk '{print $3}')"
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed."
    echo "   You can use a cloud provider like Supabase or Railway instead."
else
    echo "PostgreSQL $(psql --version | awk '{print $3}')"
fi

echo ""
echo "Installing dependencies..."
npm install

echo ""
echo "Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file - PLEASE EDIT IT WITH YOUR CONFIGURATION"
else
    echo ".env already exists, skipping..."
fi

echo ""
echo "Setting up database..."
echo "Make sure to configure DATABASE_URL in .env first!"
read -p "Have you configured your DATABASE_URL? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:generate
    npm run db:push
    echo "Database setup complete!"
else
    echo "Skipping database setup. Run 'npm run db:generate && npm run db:push' after configuring."
fi

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Make sure your database is running"
echo "3. Start the development server:"
echo ""
echo "   Terminal 1 (Frontend):"
echo "   $ npm run dev"
echo ""
echo "   Terminal 2 (Signaling Server):"
echo "   $ npm run signaling"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "Documentation:"
echo "   - QUICKSTART.md - Quick start guide"
echo "   - SETUP.md - Detailed setup instructions"
echo "   - PROJECT_SUMMARY.md - Complete project overview"
echo ""
echo "Happy streaming!"
