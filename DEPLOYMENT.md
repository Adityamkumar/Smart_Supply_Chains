# Deployment Guide - Smart Supply Chain

This project is optimized for two deployment styles:
1. **Unified**: Backend serves Frontend (Simplest).
2. **Split**: Backend on **Render**, Frontend on **Vercel** (Most flexible).

---

## 🏗 Option 2: Split Deployment (Render + Vercel)

### 1. Backend (Render.com)
1. **Create Web Service**: Connect your repo.
2. **Setup**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. **Env Variables**:
   - `CORS_ORIGIN`: `https://your-app-name.vercel.app` (Your Vercel URL)
   - `MONGODB_URI`, `REDIS_URL`, `GEMINI_API_KEY`, etc.
   - `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`.

### 2. Frontend (Vercel)
1. **Create Project**: Connect your repo.
2. **Setup**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
3. **Env Variables**:
   - `VITE_API_BASE_URL`: `https://your-backend-name.onrender.com/api` (Your Render Backend URL)

---

## 🛠 Preparation (All Environments)

### Environment Variables Matrix
| Variable | Backend (Render) | Frontend (Vercel) |
| :--- | :--- | :--- |
| `CORS_ORIGIN` | ✅ Yes | ❌ No |
| `MONGODB_URI` | ✅ Yes | ❌ No |
| `VITE_API_BASE_URL` | ❌ No | ✅ Yes |
| `GEMINI_API_KEY` | ✅ Yes | ❌ No |

### Infrastructure
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Cache**: [Upstash Redis](https://upstash.com/)
- **AI**: [Google AI Studio](https://aistudio.google.com/)

## 🧪 Local Testing
1. `npm run build` (Root)
2. `npm start` (Root)
