# SideLedger AI - Construction Management Redefined

SideLedger AI is a next-generation construction management platform designed to replace traditional, inefficient manual tracking with AI-powered digital precision.

---

## 🎥 Demo 
> Demo: https://site-ledger-ai.vercel.app/ \
> Video: https://adnankhan-dev.netlify.app/projects/site-ledger-ai

---

## 🏛️ Existing System: The Paper Problem
Before SideLedger AI, most construction sites relied on:
- **Physical Registers**: Attendance and expenses were recorded manually in notebooks.
- **Delayed Reporting**: Data had to be physically moved or scanned, causing 24-48 hour delays in financial awareness.
- **Human Errors**: Manual calculations often led to budget overruns and payroll discrepancies.
- **Lack of Searchability**: Finding a specific bill from 3 months ago required digging through stacks of paper.

---

## ⚠️ Problem Statement
Construction managers struggle with **information asymmetry**. While physical labor happens in real-time, the data (expenses, worker hours, material costs) often lags significantly behind. This gap leads to:
1. **Budget Leakage**: Small expenses go unrecorded, accumulating into large losses.
2. **Invisible Trends**: Managers can't "see" that material costs are rising until after the project is over.
3. **Inefficient Communication**: Reports take days to compile instead of seconds.

---

## 🚀 Key Features
- **AI Executive Summary**: Real-time AI-generated insights that analyze your project health and provide actionable advice.
- **Dynamic Cost Breakdown**: Interactive analytics (Pie Charts/Bar Charts) showing exactly where every Rupee is spent.
- **Labor & Attendance Management**: Digital worker tracking with shift management and daily rate calculations.
- **Automated Invoicing**: Professional PDF invoicing with status tracking (Unpaid/Paid/Overdue).

---

## 🛠️ Technical Challenges Solved
- **Optimized Performance**: Integrated **Redis Caching** for the analytics engine, reducing dashboard load times from seconds to milliseconds.
- **Production Resilience**: Developed a "Smart Fallback" system where the application handles Redis-less environments (like free-tier hosting) without crashing.
- **Responsive Fluid Layout**: Engineered a custom grid system that seamlessly adapts from 27-inch monitors to mobile devices, ensuring data legibility everywhere.
- **Secure AI Integration**: Implemented a robust proxy layer for the Gemini API to handle rate limits and provide user-friendly error feedback.
- **CORS & Deployment Architecture**: Fine-tuned backend middleware to support dynamic Vercel subdomains and cross-platform communication.

---

## 💻 Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Lucide React, Recharts, GSAP (Animations).
- **Backend**: Node.js, Express, TypeScript (Standardized for production build).
- **Database**: MongoDB with Mongoose (Structured Schema Design).
- **Performance**: Redis (ioredis) for high-speed data retrieval.
- **AI Core**: Google Gemini API with custom prompt engineering.
- **Security**: JWT Authentication, Bcryptjs, Helmet, and Rate Limiting.


---

## ⚙️ How to Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/AdnanKhan2003/SideLedger-ai.git
   cd SideLedger-ai
   ```

2. **Install Dependencies**:
   - For Backend:
     ```bash
     cd server && npm install
     ```
   - For Frontend:
     ```bash
     cd client && npm install
     ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `server` directory and a `.env.local` file in the `client` directory (see templates below).

4. **Run the Project**:
   - Start Backend: `cd server && npm run dev`
   - Start Frontend: `cd client && npm run dev`

---

## 🔑 Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
REDIS_URL=redis://localhost:6379 (Optional if using smart fallback)
FRONTEND_URL=http://localhost:3000
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🎯 Conclusion
SideLedger AI is not just a tool; it's a **digital partner** for construction teams. By bridging the gap between the physical site and digital analytics, it empowers managers to make data-driven decisions that save time, reduce waste, and increase profitability.

---
*Built with ❤️ for modern construction developers.*
