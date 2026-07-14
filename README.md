# ShopNow - Full-Stack E-Commerce Platform

A modern, responsive e-commerce platform built with Next.js frontend, Express.js backend, and PostgreSQL database.

## Live Demo

- **Frontend**: [https://your-vercel-url.vercel.app](https://your-vercel-url.vercel.app)
- **Backend API**: [https://your-render-url.onrender.com](https://your-render-url.onrender.com)

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shop.com | admin123 |
| User | user@shop.com | user123 |

## Features

### Customer Features
- Browse products with search and category filtering
- Product detail pages with images
- Shopping cart with quantity management
- User authentication (register/login)
- Checkout with shipping address
- Order history tracking

### Admin Features
- Dashboard with statistics
- Product management (CRUD operations)
- Order management with status updates
- Role-based access control

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│                   (Next.js + React)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Pages     │  │ Components  │  │   Context   │     │
│  │  (App Dir)  │  │  (UI Lib)   │  │ (Auth/Cart) │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                           │
                    HTTP/REST API
                           │
┌─────────────────────────────────────────────────────────┐
│                       Backend                           │
│                  (Express.js + Node)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Routes    │  │Controllers  │  │ Middleware   │     │
│  │ /api/*      │  │  (Logic)    │  │(Auth/Valid)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                           │
                     SQL Queries
                           │
┌─────────────────────────────────────────────────────────┐
│                      Database                           │
│                    (PostgreSQL)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Users   │  │ Products │  │  Orders  │  │ Items  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  category VARCHAR(100),
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (auth required)

### Products
- `GET /api/products` - Get all products (with filtering/pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - Get all categories
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `POST /api/orders` - Create order (auth required)
- `GET /api/orders` - Get user orders (auth required)
- `GET /api/orders/:id` - Get single order (auth required)
- `GET /api/orders/admin/all` - Get all orders (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/shopnow.git
cd shopnow
```

2. **Set up the backend**
```bash
cd backend
npm install
cp .env.example .env  # Configure your database URL
npm run migrate        # Create database tables
npm run seed           # Add sample data
npm run dev            # Start development server
```

3. **Set up the frontend**
```bash
cd frontend
npm install
cp .env.local.example .env.local  # Configure API URL
npm run dev              # Start development server
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Environment Variables

**Backend (.env)**
```
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Backend (Render)
1. Create a PostgreSQL database on Render
2. Create a Web Service for the backend
3. Set environment variables
4. Deploy

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Auth**: JWT (JSON Web Tokens)
- **Deployment**: Vercel (Frontend), Render (Backend + Database)

## License

MIT