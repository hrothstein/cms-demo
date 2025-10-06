#!/bin/bash

# Heroku deployment script for Card Management System
# This script deploys both backend and frontend to separate Heroku apps

set -e

echo "🚀 Deploying Card Management System to Heroku..."

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

# Backend deployment
echo "📦 Deploying backend..."
cd backend
heroku create cms-backend-$(date +%s) --region us
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set JWT_EXPIRES_IN=1h
heroku config:set ENCRYPTION_KEY=$(openssl rand -base64 32)
heroku config:set ALLOWED_ORIGINS="*"
git subtree push --prefix=backend heroku main

# Get backend URL
BACKEND_URL=$(heroku apps:info --json | jq -r '.app.web_url')
echo "✅ Backend deployed to: $BACKEND_URL"

# Frontend deployment
echo "📦 Deploying frontend..."
cd ../frontend
heroku create cms-frontend-$(date +%s) --region us
heroku config:set VITE_API_URL=$BACKEND_URL/api/v1
git subtree push --prefix=frontend heroku main

# Get frontend URL
FRONTEND_URL=$(heroku apps:info --json | jq -r '.app.web_url')
echo "✅ Frontend deployed to: $FRONTEND_URL"

echo ""
echo "🎉 Deployment complete!"
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""
echo "Demo credentials:"
echo "Username: john.doe@example.com"
echo "Password: demo123"
