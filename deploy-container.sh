#!/bin/bash

# Container-based Heroku deployment script
# This script deploys the backend as a container to Heroku

set -e

echo "🚀 Deploying Card Management System to Heroku (Container Registry)..."

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

# Create Heroku app
APP_NAME="cms-backend-$(date +%s)"
echo "📦 Creating Heroku app: $APP_NAME"
heroku create $APP_NAME

# Add PostgreSQL addon
echo "🗄️ Adding PostgreSQL addon..."
heroku addons:create heroku-postgresql:mini -a $APP_NAME

# Set environment variables
echo "⚙️ Setting environment variables..."
heroku config:set NODE_ENV=production -a $APP_NAME
heroku config:set JWT_SECRET=$(openssl rand -base64 32) -a $APP_NAME
heroku config:set JWT_EXPIRES_IN=1h -a $APP_NAME
heroku config:set ENCRYPTION_KEY=$(openssl rand -base64 32) -a $APP_NAME
heroku config:set ALLOWED_ORIGINS="*" -a $APP_NAME

# Login to Heroku Container Registry
echo "🐳 Logging in to Heroku Container Registry..."
heroku container:login

# Build and push container
echo "🏗️ Building and pushing container..."
heroku container:push web -a $APP_NAME

# Release the container
echo "🚀 Releasing container..."
heroku container:release web -a $APP_NAME

# Get app URL
APP_URL=$(heroku apps:info -a $APP_NAME --json | jq -r '.app.web_url')
echo "✅ Backend deployed to: $APP_URL"

echo ""
echo "🎉 Deployment complete!"
echo "Backend URL: $APP_URL"
echo "API Health: $APP_URL/health"
echo "API Docs: $APP_URL/api-docs"
echo ""
echo "Demo credentials:"
echo "Username: john.doe@example.com"
echo "Password: demo123"
echo ""
echo "To deploy frontend separately, use:"
echo "  cd frontend && npm run build && npx serve -s dist"
