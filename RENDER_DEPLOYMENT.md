# 🚀 Deploy to Render (100% Free - No Credit Card)

## ✅ What You Get
- **Free forever** - No credit card needed
- **512MB RAM** - More than enough for your app
- **Automatic HTTPS** - Free SSL certificate
- **Auto-deploy** - Deploys on every git push

## ⚠️ Trade-off
- Backend **sleeps after 15 minutes** of inactivity
- First request after sleep takes **50-90 seconds** to wake up
- Subsequent requests are fast

---

## 📦 Step 1: Deploy Backend to Render

### 1. Go to Render
Visit: https://render.com

### 2. Sign Up with GitHub
- Click "Get Started for Free"
- Sign up with your GitHub account
- **No credit card required!**

### 3. Create New Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository: `AdnanKhan2003/SiteLedger-ai`
- Click "Connect"

### 4. Configure Your Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `siteledger-ai-api` |
| **Region** | Singapore (closest to India) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

### 5. Add Environment Variables

Click "Advanced" → Add these environment variables:

```
PORT=10000
NODE_ENV=production
MONGO_URI=mongodb+srv://adnanmkhan2003_db_user:HIJF8pwZbKi1sR61@cluster0.vs0qfa1.mongodb.net/sideledger-ai?appName=Cluster0
JWT_SECRET=supersecretkey123
GEMINI_API_KEY=AIzaSyBfIG9iuLc1XbaJnslTzecelaeQowCG3K0
CLOUDINARY_CLOUD_NAME=your_actual_value
CLOUDINARY_API_KEY=your_actual_value
CLOUDINARY_API_SECRET=your_actual_value
```

### 6. Deploy!
- Click "Create Web Service"
- Wait 5-10 minutes for first deployment
- Your API will be live at: `https://siteledger-ai-api.onrender.com`

---

## 🎯 Step 2: Deploy Frontend to Vercel

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy Frontend
```bash
cd client
vercel login
vercel
```

### 3. Set Environment Variable
```bash
vercel env add NEXT_PUBLIC_API_URL
```
Enter: `https://siteledger-ai-api.onrender.com`
Select: **Production**

### 4. Deploy to Production
```bash
vercel --prod
```

Your frontend will be live at: `https://siteledger-ai.vercel.app`

---

## 🔧 Step 3: Update CORS

After getting your Vercel URL, update `server/src/app.ts` (around line 23):

```typescript
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://siteledger-ai.vercel.app',  // Your Vercel URL
        'https://siteledger-ai-*.vercel.app'  // Preview deployments
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Then:
```bash
git add .
git commit -m "Update CORS for production"
git push origin main
```

Render will **auto-deploy** the changes!

---

## ✅ Done!

Your app is now live:
- **Frontend**: https://siteledger-ai.vercel.app
- **Backend**: https://siteledger-ai-api.onrender.com

---

## 💡 Tips

### Keep Backend Awake (Optional)
Use a free service like **UptimeRobot** to ping your backend every 5 minutes:
- Visit: https://uptimerobot.com
- Add monitor: `https://siteledger-ai-api.onrender.com/api/health`
- This keeps your backend from sleeping!

### View Logs
- Go to Render dashboard
- Click on your service
- Click "Logs" tab

### Redeploy
- Just push to GitHub - Render auto-deploys!
- Or click "Manual Deploy" in Render dashboard
