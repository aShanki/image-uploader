#!/bin/bash

# Kill any existing processes
pkill -f "go run main.go" || true
pkill -f "next" || true
pkill -f "./main" || true

# Create necessary directories
mkdir -p /home/synthetix/images

# Build and start backend
cd backend
go build
./main &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Build and start frontend
cd ../frontend
npm run build

# Run tests
npm run test:e2e
TEST_EXIT_CODE=$?

# Cleanup
kill $BACKEND_PID || true
pkill -f "./main" || true
pkill -f "next" || true

# Exit with test exit code
exit $TEST_EXIT_CODE