const pool = require('../db/connection');
const resUtils = require('../utils/response');

exports.createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, shipping_address } = req.body;

    if (!items || items.length === 0) {
      return resUtils.badRequest(res, 'No items in order');
    }

    await client.query('BEGIN');

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const productResult = await client.query(
        'SELECT id, price, stock FROM products WHERE id = $1',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return resUtils.notFound(res, `Product ${item.product_id} not found`);
      }

      const product = productResult.rows[0];
      if (product.stock < item.quantity) {
        await client.query('ROLLBACK');
        return resUtils.badRequest(res, `Insufficient stock for product ${item.product_id}`);
      }

      total += product.price * item.quantity;
      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price: product.price
      });

      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, shipping_address) 
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, total, shipping_address]
    );

    const order = orderResult.rows[0];

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price]
      );
    }

    await client.query('COMMIT');

    const fullOrder = await client.query(
      `SELECT o.*, json_agg(json_build_object(
        'id', oi.id,
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'price', oi.price,
        'product_name', p.name
      )) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id`,
      [order.id]
    );

    resUtils.created(res, fullOrder.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create order error:', err);
    resUtils.serverError(res);
  } finally {
    client.release();
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, json_agg(json_build_object(
        'id', oi.id,
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'price', oi.price,
        'product_name', p.name
      )) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    resUtils.success(res, result.rows);
  } catch (err) {
    resUtils.serverError(res);
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT o.*, json_agg(json_build_object(
        'id', oi.id,
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'price', oi.price,
        'product_name', p.name
      )) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1 AND o.user_id = $2
      GROUP BY o.id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return resUtils.notFound(res, 'Order not found');
    }

    resUtils.success(res, result.rows[0]);
  } catch (err) {
    resUtils.serverError(res);
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name as user_name, u.email as user_email,
        json_agg(json_build_object(
          'product_name', p.name,
          'quantity', oi.quantity,
          'price', oi.price
        )) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      GROUP BY o.id, u.name, u.email
      ORDER BY o.created_at DESC`
    );

    resUtils.success(res, result.rows);
  } catch (err) {
    resUtils.serverError(res);
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return resUtils.badRequest(res, 'Invalid status');
    }

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return resUtils.notFound(res, 'Order not found');
    }

    resUtils.success(res, result.rows[0]);
  } catch (err) {
    resUtils.serverError(res);
  }
};