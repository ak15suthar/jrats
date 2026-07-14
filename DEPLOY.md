# Deployment Guide

## Deploy Backend on Vercel

### 1. Push backend code to GitHub
Create a separate repo or subfolder for the backend.

### 2. Import on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your backend repo
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `backend` (if monorepo) or `/` (if separate repo)
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`

### 3. Add Environment Variables
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_production_secret
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### 4. Deploy
Click Deploy. Your backend URL will be: `https://your-project.vercel.app`

---

## Deploy Frontend on Vercel

### 1. Push frontend code to GitHub

### 2. Import on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your frontend repo
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (if monorepo) or `/` (if separate repo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Add Environment Variables
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
```

### 4. Deploy
Click Deploy. Your frontend URL will be: `https://your-project.vercel.app`

---

## Post-Deployment

### Update Backend CORS
After frontend is deployed, update your backend's `FRONTEND_URL` env var to include the actual frontend URL.

### Run Database Migration
Vercel doesn't run migrations automatically. Connect to your database and run:
```bash
# Locally with production DB URL
DATABASE_URL=your_production_url npm run migrate
DATABASE_URL=your_production_url npm run seed
```

Or use a tool like [Neon SQL Editor](https://console.neon.tech) / [Supabase SQL Editor](https://supabase.com/dashboard) to run the SQL directly.

---

## Database Setup (if needed)

### Option A: Supabase (Free)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings > Database > Connection string
4. Use the URI as `DATABASE_URL`

### Option B: Neon (Free)
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Use as `DATABASE_URL`

### Option C: Vercel Postgres (Free tier)
1. In your Vercel backend project, go to Storage tab
2. Create a Postgres database
3. Vercel auto-adds `POSTGRES_URL` env var
4. Update `DATABASE_URL` to use `POSTGRES_URL`

---

## SQL Schema (for manual setup)

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

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);
```

## Sample Data (for manual insert)

```sql
-- Admin user (password: admin123)
INSERT INTO users (email, password, name, role) VALUES 
('admin@shop.com', '$2a$10$YourHashedPasswordHere', 'Admin User', 'admin');

-- Regular user (password: user123)
INSERT INTO users (email, password, name, role) VALUES 
('user@shop.com', '$2a$10$YourHashedPasswordHere', 'Test User', 'user');

-- Products
INSERT INTO products (name, description, price, image_url, category, stock) VALUES
('Wireless Headphones', 'Premium noise-cancelling wireless headphones.', 199.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 'Electronics', 50),
('Smart Watch', 'Feature-rich smartwatch with health tracking.', 299.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 'Electronics', 30),
('Leather Backpack', 'Genuine leather backpack with laptop compartment.', 149.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 'Fashion', 25),
('Running Shoes', 'Lightweight, breathable running shoes.', 129.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'Sports', 100),
('Coffee Maker', 'Programmable coffee maker with thermal carafe.', 89.99, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500', 'Home', 40),
('Desk Lamp', 'Adjustable LED desk lamp with wireless charging.', 59.99, 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500', 'Home', 60),
('Yoga Mat', 'Non-slip premium yoga mat with carrying strap.', 49.99, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', 'Sports', 75),
('Sunglasses', 'UV400 polarized sunglasses.', 79.99, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', 'Fashion', 45);
```