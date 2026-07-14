const pool = require('../db/connection');
const resUtils = require('../utils/response');

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];
    const conditions = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const offset = (page - 1) * limit;
    params.push(limit, offset);
    query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    let countQuery = 'SELECT COUNT(*) FROM products';
    const countParams = [];
    if (category) {
      countParams.push(category);
      countQuery += ` WHERE category = $${countParams.length}`;
    }
    const countResult = await pool.query(countQuery, countParams);

    resUtils.success(res, {
      products: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      pages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (err) {
    console.error('Get products error:', err);
    resUtils.serverError(res);
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return resUtils.notFound(res, 'Product not found');
    }
    resUtils.success(res, result.rows[0]);
  } catch (err) {
    resUtils.serverError(res);
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, image_url, category, stock } = req.body;

    if (!name || !price) {
      return resUtils.badRequest(res, 'Name and price are required');
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, image_url, category, stock) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, price, image_url, category, stock || 0]
    );

    resUtils.created(res, result.rows[0]);
  } catch (err) {
    console.error('Create product error:', err);
    resUtils.serverError(res);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, category, stock } = req.body;

    const result = await pool.query(
      `UPDATE products 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description), 
           price = COALESCE($3, price), 
           image_url = COALESCE($4, image_url), 
           category = COALESCE($5, category), 
           stock = COALESCE($6, stock),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [name, description, price, image_url, category, stock, id]
    );

    if (result.rows.length === 0) {
      return resUtils.notFound(res, 'Product not found');
    }

    resUtils.success(res, result.rows[0]);
  } catch (err) {
    resUtils.serverError(res);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return resUtils.notFound(res, 'Product not found');
    }

    resUtils.success(res, { message: 'Product deleted successfully' });
  } catch (err) {
    resUtils.serverError(res);
  }
};

exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category');
    resUtils.success(res, result.rows.map(r => r.category));
  } catch (err) {
    resUtils.serverError(res);
  }
};