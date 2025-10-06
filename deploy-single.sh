#!/bin/bash

# Single App Deployment Script
# Deploys backend to Heroku and prepares frontend for Vercel/Netlify

set -e

echo "🚀 Deploying Card Management System (Single App Approach)..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Please login to Heroku first:"
    echo "   heroku login"
    exit 1
fi

# Deploy backend
echo "📦 Deploying backend to Heroku..."
./deploy-container.sh

# Get backend URL
BACKEND_URL=$(heroku apps:info --json | jq -r '.app.web_url')
echo "✅ Backend deployed to: $BACKEND_URL"

# Prepare frontend for deployment
echo "🌐 Preparing frontend for deployment..."
cd frontend

# Create production environment file
echo "VITE_API_URL=$BACKEND_URL/api/v1" > .env.production

# Build frontend
echo "🏗️ Building frontend..."
npm run build

echo ""
echo "🎉 Backend deployment complete!"
echo "Backend URL: $BACKEND_URL"
echo "API Health: $BACKEND_URL/health"
echo "API Docs: $BACKEND_URL/api-docs"
echo ""
echo "📁 Frontend built in: frontend/dist/"
echo ""
echo "🌐 Next steps for frontend deployment:"
echo ""
echo "Option 1 - Vercel (Recommended):"
echo "1. Go to https://vercel.com"
echo "2. Import your GitHub repository"
echo "3. Set build command: npm run build"
echo "4. Set output directory: dist"
echo "5. Add environment variable: VITE_API_URL=$BACKEND_URL/api/v1"
echo ""
echo "Option 2 - Netlify:"
echo "1. Go to https://netlify.com"
echo "2. Drag and drop the 'frontend/dist' folder"
echo "3. Or connect your GitHub repository"
echo ""
echo "Option 3 - Manual upload:"
echo "Upload the contents of 'frontend/dist/' to any static hosting service"
echo ""
echo "Demo credentials:"
echo "Username: john.doe@example.com"
echo "Password: demo123"
