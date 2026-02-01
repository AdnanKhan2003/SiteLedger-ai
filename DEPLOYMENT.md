# 🚀 SideLedger AI Deployment Guide

## ✅ Build Status
- **Client Build**: ✅ Passed
- **Server Build**: ✅ Passed

---

## 📦 Deployment Stack
- **Frontend**: Vercel (Next.js)
- **Backend**: Fly.io (Node.js/Express)
- **Database**: MongoDB Atlas (already hosted)
- **Storage**: Cloudinary (already hosted)

---

## 🎯 Step 1: Deploy Backend to Fly.io

### Install Fly CLI
```bash
# Windows (PowerShell)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Deploy Backend
```bash
cd server

# Login to Fly.io (creates free account if needed)
fly auth login

# Launch the app (follow prompts)
fly launch

# When prompted:
# - App name: sideledger-ai-api (or your choice)
# - Region: sin (Singapore)
# - Would you like to set up a Postgresql database? NO
# - Would you like to deploy now? NO (we need to set env vars first)

# Set environment variables
fly secrets set MONGO_URI="mongodb+srv://adnanmkhan2003_db_user:HIJF8pwZbKi1sR61@cluster0.vs0qfa1.mongodb.net/sideledger-ai?appName=Cluster0"
fly secrets set JWT_SECRET="supersecretkey123"
fly secrets set CLOUDINARY_CLOUD_NAME="your_cloudinary_name"
fly secrets set CLOUDINARY_API_KEY="your_cloudinary_key"
fly secrets set CLOUDINARY_API_SECRET="your_cloudinary_secret"
fly secrets set GEMINI_API_KEY="AIzaSyBfIG9iuLc1XbaJnslTzecelaeQowCG3K0"

# Deploy!
fly deploy

# Get your backend URL
fly status
# Your API will be at: https://sideledger-ai-api.fly.dev
```

---

## 🎯 Step 2: Deploy Frontend to Vercel

### Install Vercel CLI
```bash
npm i -g vercel
```

### Deploy Frontend
```bash
cd client

# Login to Vercel
vercel login

# Deploy
vercel

# When prompted:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: sideledger-ai
# - Directory: ./ (press Enter)
# - Override settings? N

# Set environment variable for production
vercel env add NEXT_PUBLIC_API_URL

# When prompted, enter: https://sideledger-ai-api.fly.dev
# Select: Production

# Deploy to production
vercel --prod
```

---

## 🔧 Update CORS on Backend

After deploying frontend, update `server/src/app.ts`:

```typescript
app.use(cors({
    origin: [
        'http://localhost:3000', 
        'https://sideledger-ai.vercel.app',  // Add your Vercel URL
        'https://sideledger-ai-*.vercel.app'  // For preview deployments
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Then redeploy backend:
```bash
cd server
fly deploy
```

---

## 🎉 Done!

Your app is now live:
- **Frontend**: https://sideledger-ai.vercel.app
- **Backend**: https://sideledger-ai-api.fly.dev

---

## 💡 Tips

### Auto-deploy on Git Push
- **Vercel**: Automatically deploys on push to `main` branch
- **Fly.io**: Set up GitHub Actions for auto-deploy

### Monitor Your App
```bash
# View backend logs
fly logs

# Check backend status
fly status

# SSH into backend (if needed)
fly ssh console
```

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month
- **Fly.io**: 256MB RAM, always-on within free tier
- **MongoDB Atlas**: 512MB storage

---

## 🐛 Troubleshooting

### Backend not responding?
```bash
fly logs
```

### Frontend can't connect to backend?
Check CORS settings and environment variables

### Need to update environment variables?
```bash
fly secrets set KEY="value"
```
