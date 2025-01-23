#!/bin/bash

# Kill any existing processes
pkill -f "go run main.go" || true
pkill -f "next" || true
pkill -f "./backend/main" || true
pkill -f "node" || true

# Create necessary directories
sudo mkdir -p /home/synthetix/images
sudo chmod 777 /home/synthetix/images

# Build and start backend
cd backend
echo "Building backend..."
go mod tidy
go build -o main
./main &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 2

# Build and start frontend
cd ../frontend
echo "Installing frontend dependencies..."
npm install

# Set up environment variables
echo "Setting up environment..."
cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:4001
AUTH_USERNAME=admin
AUTH_PASSWORD=secure_password_here
EOL

echo "Building frontend..."
npm run build

# Run tests
echo "Running tests..."
BACKEND_URL=http://localhost:4001 FRONTEND_URL=http://localhost:3000 npm run test:e2e
TEST_EXIT_CODE=$?

# Cleanup
echo "Cleaning up processes..."
kill $BACKEND_PID || true
pkill -f "./backend/main" || true
pkill -f "next" || true
pkill -f "node" || true

# Exit with test exit code
exit $TEST_EXIT_CODE