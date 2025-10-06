#!/bin/bash

# Two Heroku Apps Deployment Script
# Deploys backend and frontend to separate Heroku apps

set -e

echo "🚀 Deploying Card Management System to TWO Heroku Apps..."

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

# Deploy Backend
echo "📦 Deploying BACKEND to Heroku..."
BACKEND_APP_NAME="cms-backend-$(date +%s)"
echo "Creating backend app: $BACKEND_APP_NAME"

heroku create $BACKEND_APP_NAME
heroku addons:create heroku-postgresql:mini -a $BACKEND_APP_NAME
heroku config:set NODE_ENV=production -a $BACKEND_APP_NAME
heroku config:set JWT_SECRET=$(openssl rand -base64 32) -a $BACKEND_APP_NAME
heroku config:set JWT_EXPIRES_IN=1h -a $BACKEND_APP_NAME
heroku config:set ENCRYPTION_KEY=$(openssl rand -base64 32) -a $BACKEND_APP_NAME
heroku config:set ALLOWED_ORIGINS="*" -a $BACKEND_APP_NAME

# Login to Heroku Container Registry
heroku container:login

# Build and push backend container
heroku container:push web -a $BACKEND_APP_NAME
heroku container:release web -a $BACKEND_APP_NAME

# Get backend URL
BACKEND_URL=$(heroku apps:info -a $BACKEND_APP_NAME --json | jq -r '.app.web_url')
echo "✅ Backend deployed to: $BACKEND_URL"

# Deploy Frontend
echo "📦 Deploying FRONTEND to Heroku..."
FRONTEND_APP_NAME="cms-frontend-$(date +%s)"
echo "Creating frontend app: $FRONTEND_APP_NAME"

heroku create $FRONTEND_APP_NAME
heroku config:set VITE_API_URL=$BACKEND_URL/api/v1 -a $FRONTEND_APP_NAME

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
echo "VITE_API_URL=$BACKEND_URL/api/v1" > .env.production
npm run build

# Create a simple Express server for frontend
cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
EOF

# Add express dependency
npm install express

# Create package.json for frontend server
cat > package-heroku.json << 'EOF'
{
  "name": "cms-frontend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# Deploy frontend
echo "🚀 Deploying frontend to Heroku..."
git init
git add .
git commit -m "Deploy frontend to Heroku"
heroku git:remote -a $FRONTEND_APP_NAME
git push heroku main

# Get frontend URL
FRONTEND_URL=$(heroku apps:info -a $FRONTEND_APP_NAME --json | jq -r '.app.web_url')
echo "✅ Frontend deployed to: $FRONTEND_URL"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📱 Your Card Management System is live:"
echo "Frontend: $FRONTEND_URL"
echo "Backend:  $BACKEND_URL"
echo "API Docs: $BACKEND_URL/api-docs"
echo ""
echo "🔐 Demo credentials:"
echo "Username: john.doe@example.com"
echo "Password: demo123"
echo ""
echo "📊 Heroku Dashboard:"
echo "https://dashboard.heroku.com/apps"
echo ""
echo "🔧 To update the apps:"
echo "Backend:  git subtree push --prefix=. heroku main"
echo "Frontend: cd frontend && git push heroku main"
