const pool = require('./connection');
const bcrypt = require('bcryptjs');

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await client.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
      ['admin@shop.com', adminPassword, 'Admin User', 'admin']
    );

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    await client.query(
      `INSERT INTO users (email, password, name, role) 
       VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
      ['user@shop.com', userPassword, 'Test User', 'user']
    );

    // Sample products
    const products = [
      { name: 'Wireless Headphones', description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.', price: 199.99, image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', category: 'Electronics', stock: 50 },
      { name: 'Smart Watch', description: 'Feature-rich smartwatch with health tracking and notifications.', price: 299.99, image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', category: 'Electronics', stock: 30 },
      { name: 'Leather Backpack', description: 'Genuine leather backpack with laptop compartment.', price: 149.99, image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', category: 'Fashion', stock: 25 },
      { name: 'Running Shoes', description: 'Lightweight, breathable running shoes for everyday training.', price: 129.99, image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', category: 'Sports', stock: 100 },
      { name: 'Coffee Maker', description: 'Programmable coffee maker with thermal carafe.', price: 89.99, image_url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500', category: 'Home', stock: 40 },
      { name: 'Desk Lamp', description: 'Adjustable LED desk lamp with wireless charging base.', price: 59.99, image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500', category: 'Home', stock: 60 },
      { name: 'Yoga Mat', description: 'Non-slip premium yoga mat with carrying strap.', price: 49.99, image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', category: 'Sports', stock: 75 },
      { name: 'Sunglasses', description: 'UV400 polarized sunglasses with polarized lenses.', price: 79.99, image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', category: 'Fashion', stock: 45 },
    ];

    for (const product of products) {
      await client.query(
        `INSERT INTO products (name, description, price, image_url, category, stock) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [product.name, product.description, product.price, product.image_url, product.category, product.stock]
      );
    }

    await client.query('COMMIT');
    console.log('Seed completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seed;