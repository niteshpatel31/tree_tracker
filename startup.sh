#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "======================================"
echo "    Starting Tree Tracker Project     "
echo "======================================"

echo "Releasing necessary ports..."
kill -9 $(lsof -t -i:5000,7134) 2>/dev/null || true

# Start backend
echo "[1/2] Setting up and starting Backend..."
cd backend
echo "Installing backend dependencies (using pnpm)..."
pnpm install

echo "Building backend..."
NODE_ENV=development pnpm run build

echo "Starting backend server..."
NODE_ENV=development pnpm run start &
BACKEND_PID=$!
cd ..

# Start frontend
echo "[2/2] Setting up and starting Frontend..."
cd frontend
echo "Installing frontend dependencies (using pnpm)..."
pnpm install

echo "Starting frontend server..."
# Start the frontend dev server in the foreground
PORT=7134 pnpm run dev

# If the user stops the frontend server (CTRL+C), trap it and kill the backend too
trap "echo 'Stopping servers...'; kill $BACKEND_PID" EXIT