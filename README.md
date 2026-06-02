# Sales Record Management System

National Practical Exam Project

## Installation

```bash
cd backend-mysql && npm install
cd ../backend-mongodb && npm install
cd ../frontend && npm install
```

## Database Setup (MySQL)

```bash
cd backend-mysql
cp .env.example .env
npm run db:init
```

## Run Development Server

MySQL API (port 5555):

```bash
cd backend-mysql && npm run dev
```

MongoDB API (port 5555 — run one backend at a time):

```bash
cd backend-mongodb && npm run dev
```

Frontend (port 5173):

```bash
cd frontend && npm run dev
```

Default login: `admin` / `admin123`

## Environment Variables

### backend-mysql

| Variable | Description |
|----------|-------------|
| PORT | API port (5555) |
| JWT_SECRET | Secret for JWT tokens |
| DB_HOST | MySQL host |
| DB_USER | MySQL user |
| DB_PASSWORD | MySQL password |
| DB_NAME | Database name (SRMS) |
| DB_PORT | MySQL port |

### backend-mongodb

| Variable | Description |
|----------|-------------|
| PORT | API port (5555) |
| JWT_SECRET | Secret for JWT tokens |
| MONGO_URI | MongoDB connection string |

## API Endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET/POST /api/customers
- GET/POST /api/products
- GET/POST/PUT/DELETE /api/sales
- GET /api/reports?period=daily|weekly|monthly&date=YYYY-MM-DD&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&month=YYYY-MM

## Folder Structure

```
undefined/
├── README.md
├── frontend/
├── backend-mysql/
└── backend-mongodb/
```
