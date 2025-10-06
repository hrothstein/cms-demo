# Card Management System - Deployment Guide

This guide covers deploying the Card Management System to various platforms.

## 🐳 Local Development with Docker

### Prerequisites
- Docker and Docker Compose installed
- Git

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd CMS

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# Database: localhost:5432
```

### Services
- **Frontend**: React app on port 5173
- **Backend**: Node.js API on port 3000
- **Database**: PostgreSQL on port 5432

## ☁️ Heroku Deployment

### Option 1: Container Registry (Recommended)

#### Prerequisites
- Heroku CLI installed
- Docker installed
- Git repository

#### Deploy Backend
```bash
# Run the deployment script
./deploy-container.sh

# Or manually:
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set ENCRYPTION_KEY=$(openssl rand -base64 32)
heroku container:login
heroku container:push web
heroku container:release web
```

#### Deploy Frontend
```bash
# Build and deploy frontend
cd frontend
npm run build
npx serve -s dist

# Or use Vercel/Netlify for frontend
# Upload the 'dist' folder to your preferred static hosting service
```

### Option 2: Traditional Git Deployment

#### Backend
```bash
# Create Heroku app
heroku create cms-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set ENCRYPTION_KEY=$(openssl rand -base64 32)

# Deploy
git subtree push --prefix=. heroku main
```

#### Frontend
```bash
# Create separate Heroku app for frontend
heroku create cms-frontend

# Set API URL
heroku config:set VITE_API_URL=https://your-backend-app.herokuapp.com/api/v1

# Deploy
git subtree push --prefix=frontend heroku main
```

## 🌐 Other Cloud Platforms

### Vercel (Frontend)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variable: `VITE_API_URL=https://your-backend-url/api/v1`

### Netlify (Frontend)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Set environment variable: `VITE_API_URL=https://your-backend-url/api/v1`

### Railway (Full Stack)
1. Connect your GitHub repository
2. Railway will auto-detect the docker-compose.yml
3. Set environment variables in Railway dashboard

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Create two apps: one for backend, one for frontend
3. Use the provided Dockerfiles

## 🔧 Environment Variables

### Backend
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-32-character-secret
JWT_EXPIRES_IN=1h
ENCRYPTION_KEY=your-32-character-encryption-key
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Frontend
```bash
VITE_API_URL=https://your-backend-domain.com/api/v1
```

## 📊 Database Setup

The database will be automatically set up with:
- Schema creation
- Seed data insertion
- Demo users and cards

### Demo Credentials
- **john.doe@example.com** / `demo123`
- **jane.smith@example.com** / `demo123`
- **bob.johnson@example.com** / `demo123`

## 🚀 Production Checklist

- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] Set strong ENCRYPTION_KEY (32+ characters)
- [ ] Configure ALLOWED_ORIGINS for your domain
- [ ] Set up SSL/HTTPS
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and logging
- [ ] Configure backup for database
- [ ] Set up CI/CD pipeline

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Ensure database is accessible
   - Verify credentials

2. **CORS Errors**
   - Check ALLOWED_ORIGINS setting
   - Ensure frontend URL is included

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **Authentication Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Ensure proper CORS configuration

### Logs
```bash
# Heroku logs
heroku logs --tail -a your-app-name

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📞 Support

For deployment issues:
1. Check the logs first
2. Verify environment variables
3. Test locally with Docker
4. Check platform-specific documentation
