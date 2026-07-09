#!/bin/bash
set -e

echo "🚀 Starting Maple Pulse Backend Server..."
echo "📦 Ensuring dependencies are installed..."

# Make sure node_modules exists and dependencies are installed
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules not found, installing dependencies..."
  npm install
fi

echo "✅ Dependencies ready"
echo "🔧 Starting Node.js server on port ${PORT:-5000}..."

# Start the server
exec npm start
