# Assessment Submission

Complete this form after deploying the application.

## Project: Inventory & Order Management System

### GitHub Repository
```
https://github.com/YOUR_USERNAME/inventory-order-system
```

### Docker Hub Images
| Image | Link |
|-------|------|
| Backend | `https://hub.docker.com/r/YOUR_USERNAME/inventory-backend` |
| Frontend | `https://hub.docker.com/r/YOUR_USERNAME/inventory-frontend` |

### Live Application URLs
| Service | URL |
|---------|-----|
| Frontend (React UI) | `https://your-app.vercel.app` |
| Backend API | `https://your-backend.onrender.com` |
| API Documentation | `https://your-backend.onrender.com/docs` |
| Health Check | `https://your-backend.onrender.com/health` |

---

## Requirements Checklist

| Requirement | Status |
|-------------|--------|
| Python backend (FastAPI) | Done |
| React frontend | Done |
| PostgreSQL database | Done |
| Unique product SKUs | Done |
| Unique customer emails | Done |
| Inventory validation on orders | Done |
| Automatic stock reduction on order | Done |
| Block orders when stock insufficient | Done |
| Docker containerization | Done |
| Docker Compose configuration | Done |
| Environment variables (no hardcoded credentials) | Done |
| Deployment configs (Render + Vercel) | Done |

---

## Quick Deploy Steps

### Step 1: Run locally with Docker
```powershell
cd c:\Users\Admin\Desktop\Shrista
docker compose up --build -d
docker compose exec backend python scripts/seed.py
```
Open http://localhost:3000

### Step 2: Push to GitHub
```powershell
git add .
git commit -m "Inventory & Order Management System - Assessment submission"
git remote add origin https://github.com/YOUR_USERNAME/inventory-order-system.git
git push -u origin main
```

### Step 3: Deploy backend on Render (free)
1. Go to https://render.com → New → Blueprint
2. Connect GitHub repo → uses `render.yaml`
3. Set `CORS_ORIGINS` to your Vercel frontend URL after Step 4

### Step 4: Deploy frontend on Vercel (free)
1. Go to https://vercel.com → Import Git Repository
2. Root Directory: `frontend`
3. Environment Variable: `VITE_API_URL` = `https://YOUR-BACKEND.onrender.com/api`
4. Deploy

### Step 5: Push Docker images to Docker Hub
```powershell
docker login
docker build -t YOUR_USERNAME/inventory-backend:latest ./backend
docker push YOUR_USERNAME/inventory-backend:latest

docker build -t YOUR_USERNAME/inventory-frontend:latest --build-arg VITE_API_URL=https://YOUR-BACKEND.onrender.com/api ./frontend
docker push YOUR_USERNAME/inventory-frontend:latest
```
