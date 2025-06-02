#!/bin/bash

# Deploy script for Railway
echo "🚀 Deploying Family Travel Tracker to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null
then
    echo "Railway CLI not found, installing..."
    npm install -g @railway/cli
fi

# Login to Railway (will open browser)
echo "🔑 Logging in to Railway..."
railway login

# Initialize project if not already done
if [ ! -f .railway/config.json ]; then
    echo "📦 Initializing Railway project..."
    railway init
fi

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set DATABASE_URL="$DATABASE_URL"
railway variables set NODE_ENV="production"
railway variables set PORT="3000"

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete! Check the URL above to access your app."
