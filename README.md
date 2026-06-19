# Inventory & Order Management System

A full-stack application for managing products, customers, orders, and inventory tracking. Built with **FastAPI**, **React**, **PostgreSQL**, and **Docker**.

## Features

- **Products** — CRUD with unique SKU enforcement
- **Customers** — CRUD with unique email enforcement
- **Orders** — Create orders with multiple line items; automatic stock reduction on placement
- **Inventory** — Real-time stock tracking with low/out-of-stock indicators
- **Business Rules**
  - Product SKUs must be unique
  - Customer emails must be unique
  - Orders rejected when stock is insufficient
  - Stock automatically reduced when an order is placed
  - Stock restored when an order is cancelled

## Tech Stack

| Layer      | Technology        |
|-----------|-------------------|
| Backend   | Python, FastAPI   |
| Frontend  | React, Vite       |
| Database  | PostgreSQL 16     |
| Container | Docker, Compose   |

## Quick Start (Docker)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Run the application

```bash
# Clone the repository
git clone <your-repo-url>
cd Shrista

# Copy environment file
cp .env.example .env

# Build and start all services
docker compose up --build -d

# (Optional) Seed sample data
docker compose exec backend python scripts/seed.py
```

### Access the application

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3000        |
| Backend   | http://localhost:8000        |
| API Docs  | http://localhost:8000/docs   |
| Health    | http://localhost:8000/health   |

## Local Development (without Docker)

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt

# Set DATABASE_URL to your PostgreSQL instance
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173 with API at http://localhost:8000/api.

## API Endpoints

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | `/api/products`             | List all products        |
| POST   | `/api/products`             | Create product           |
| PUT    | `/api/products/{id}`        | Update product           |
| DELETE | `/api/products/{id}`        | Delete product           |
| GET    | `/api/customers`            | List all customers       |
| POST   | `/api/customers`            | Create customer          |
| PUT    | `/api/customers/{id}`       | Update customer          |
| DELETE | `/api/customers/{id}`       | Delete customer          |
| GET    | `/api/orders`               | List all orders          |
| POST   | `/api/orders`               | Create order             |
| PATCH  | `/api/orders/{id}/status`   | Update order status      |
| GET    | `/api/inventory`            | Inventory snapshot       |
| GET    | `/health`                   | Health check             |

## Environment Variables

| Variable       | Description                          | Default                                      |
|----------------|--------------------------------------|----------------------------------------------|
| `DATABASE_URL` | PostgreSQL connection string         | `postgresql://postgres:postgres@db:5432/inventory_db` |
| `CORS_ORIGINS` | Comma-separated allowed origins      | `http://localhost:5173,http://localhost:3000` |
| `VITE_API_URL` | Frontend API base URL (build-time)   | `http://localhost:8000/api`                  |
| `POSTGRES_*`   | Database credentials for Docker      | See `.env.example`                           |

## Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Inventory & Order Management System"
git remote add origin https://github.com/YOUR_USERNAME/inventory-order-system.git
git push -u origin main
```

### 2. Backend + Database (Render — free tier)

1. Create account at [render.com](https://render.com)
2. Connect your GitHub repository
3. Use the included `render.yaml` blueprint, or manually:
   - Create a **PostgreSQL** database (free)
   - Create a **Web Service** with Docker, pointing to `./backend/Dockerfile`
   - Set `DATABASE_URL` from the database connection string
   - Set `CORS_ORIGINS` to your frontend URL (e.g. `https://your-app.vercel.app`)
4. Note your backend URL: `https://inventory-backend.onrender.com`

### 3. Frontend (Vercel — free tier)

1. Create account at [vercel.com](https://vercel.com)
2. Import the GitHub repository
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`
5. Deploy — note your frontend URL: `https://your-app.vercel.app`

### 4. Docker Hub Image

```bash
# Build and push backend image
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-backend:latest ./backend
docker login
docker push YOUR_DOCKERHUB_USERNAME/inventory-backend:latest

# Build and push frontend image
docker build -t YOUR_DOCKERHUB_USERNAME/inventory-frontend:latest \
  --build-arg VITE_API_URL=https://your-backend.onrender.com/api ./frontend
docker push YOUR_DOCKERHUB_USERNAME/inventory-frontend:latest
```

## Submission Checklist

Fill in your URLs after deployment:

| Item              | URL / Link                                      |
|-------------------|-------------------------------------------------|
| GitHub Repository | `https://github.com/YOUR_USERNAME/...`          |
| Docker Hub (API)  | `https://hub.docker.com/r/YOUR_USERNAME/inventory-backend` |
| Live Frontend     | `https://your-app.vercel.app`                   |
| Live Backend API  | `https://your-backend.onrender.com`             |
| API Documentation | `https://your-backend.onrender.com/docs`        |

## Project Structure

```
Shrista/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── routes.py        # API routes
│   │   ├── schemas.py       # Pydantic schemas
│   │   ├── config.py        # Settings
│   │   └── database.py      # DB connection
│   ├── scripts/seed.py      # Sample data seeder
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/           # Products, Customers, Orders, Inventory
│   │   ├── api/client.js    # API client
│   │   └── App.jsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── render.yaml              # Render deployment blueprint
├── .env.example
└── README.md
```

## License

MIT
