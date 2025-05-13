#!/bin/bash

# Exit on error
set -e

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Set up demo environment variables
export NODE_ENV=development
export PORT=5000
export SESSION_SECRET=demo-session-secret-thats-at-least-32-chars
export DATABASE_URL=postgresql://demo:demo@localhost:5432/demo_db
export REDIS_URL=redis://localhost:6379/1
export CORS_ORIGIN=http://localhost:5000

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "Docker is required but not installed. Please install Docker first."
  exit 1
fi

# Start Redis and PostgreSQL with Docker
echo "Starting Redis and PostgreSQL..."
docker-compose -f docker-compose.demo.yml up -d

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker exec penpal_demo_db pg_isready; do
  sleep 1
done

# Run database migrations
echo "Running database migrations..."
npm run migrate

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Seed demo data
echo "Seeding demo data..."
node scripts/seed-demo.js

# Start the application
echo "Starting the application..."
npm run dev 