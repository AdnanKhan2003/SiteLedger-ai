# 🚀 Render Deployment - Quick Start Guide

## 📋 Step 1: Sign Up on Render

1. **Open your browser** and go to: https://render.com
2. Click **"Get Started for Free"**
3. Click **"Sign in with GitHub"**
4. Authorize Render to access your GitHub account
5. ✅ **No credit card required!**

---

## 📦 Step 2: Create Web Service

1. In Render dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** if GitHub isn't connected yet
4. Find your repository: **`AdnanKhan2003/SiteLedger-ai`**
5. Click **"Connect"** next to it

---

## ⚙️ Step 3: Configure Service

### Basic Settings:

| Field | Value |
|-------|-------|
| **Name** | `siteledger-ai-api` |
| **Region** | `Singapore (Southeast Asia)` |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |

### Advanced Settings:

Click **"Advanced"** button and add these **Environment Variables**:

```
PORT=10000
NODE_ENV=production
MONGO_URI=mongodb+srv://adnanmkhan2003_db_user:HIJF8pwZbKi1sR61@cluster0.vs0qfa1.mongodb.net/sideledger-ai?appName=Cluster0
JWT_SECRET=supersecretkey123
GEMINI_API_KEY=AIzaSyBfIG9iuLc1XbaJnslTzecelaeQowCG3K0
```

**Note:** Add your actual Cloudinary credentials if you're using image uploads:
```
CLOUDINARY_CLOUD_NAME=your_value
CLOUDINARY_API_KEY=your_value
CLOUDINARY_API_SECRET=your_value
```

### Instance Type:

- Select: **"Free"** (should be selected by default)

---

## 🚀 Step 4: Deploy!

1. Click **"Create Web Service"** button at the bottom
2. Wait 5-10 minutes for the first deployment
3. Watch the logs - you'll see:
   - Installing dependencies...
   - Building TypeScript...
   - Starting server...
   - ✅ **"Live"** status when ready

4. Your backend URL will be: **`https://siteledger-ai-api.onrender.com`**

---

## ✅ Verify Backend is Working

Once deployed, test your API:
- Open: `https://siteledger-ai-api.onrender.com/api/health` (or any endpoint)
- You should see a response (not an error page)

---

## 📝 Next: Deploy Frontend

After backend is live, come back and I'll help you deploy the frontend to Vercel!

**Your backend URL:** `https://siteledger-ai-api.onrender.com`
(Save this - you'll need it for frontend deployment)
