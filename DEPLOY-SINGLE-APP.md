# Single App Deployment Guide

## 🚀 Deploy Backend to Heroku

### Step 1: Deploy Backend
```bash
# Run the deployment script
./deploy-container.sh

# This will:
# - Create Heroku app
# - Add PostgreSQL database
# - Set environment variables
# - Deploy backend container
```

### Step 2: Get Backend URL
After deployment, you'll get a URL like:
`https://cms-backend-123456789.herokuapp.com`

## 🌐 Deploy Frontend to Vercel (Free)

### Step 1: Build Frontend
```bash
cd frontend

# Update API URL to your Heroku backend
echo "VITE_API_URL=https://your-backend-app.herokuapp.com/api/v1" > .env.production

# Build for production
npm run build
```

### Step 2: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Import your `cms-demo` repository
4. Set build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Add environment variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend-app.herokuapp.com/api/v1`
6. Deploy!

## 🔧 Alternative: Deploy Frontend to Netlify

### Step 1: Build and Deploy
```bash
cd frontend
npm run build

# Deploy to Netlify
npx netlify-cli deploy --prod --dir=dist
```

## 📊 Platform Comparison

| Option | Backend | Frontend | Platform |
|--------|---------|----------|----------|
| Single Heroku + Vercel | Heroku | Vercel | Mixed |
| Two Heroku Apps | Heroku | Heroku | Heroku |
| Railway Full Stack | Railway | Railway | Railway |

## 🎯 Final URLs

After deployment:
- **Frontend:** `https://cms-demo.vercel.app`
- **Backend:** `https://cms-backend-123456.herokuapp.com`
- **API Docs:** `https://cms-backend-123456.herokuapp.com/api-docs`

## 🔐 Demo Credentials
- **john.doe@example.com** / `demo123`
- **jane.smith@example.com** / `demo123`
- **bob.johnson@example.com** / `demo123`
