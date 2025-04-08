const express = require('express');
const router = express.Router();
const pool = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [orders] = await connection.query(`
      SELECT o.id, o.supplierId, o.status, o.createdAt, s.companyName
      FROM orders o
      JOIN suppliers s ON o.supplierId = s.id
      ORDER BY o.id DESC
    `);

    for (const order of orders) {
      const [items] = await connection.query(`
        SELECT productName, quantity
        FROM order_items
        WHERE orderId = ?
      `, [order.id]);

      order.items = items;
    }

    connection.release();
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'שגיאה בשליפת ההזמנות' });
  }
});


router.get('/supplier/:id', async (req, res) => {
  const connection = await pool.getConnection();
  const [orders] = await connection.query(
    `SELECT * FROM orders WHERE supplierId = ? ORDER BY createdAt DESC`,
    [req.params.id]
  );

  const results = [];

  for (const order of orders) {
    const [items] = await connection.query(
      `SELECT productName, quantity FROM order_items WHERE orderId = ?`,
      [order.id]
    );
    results.push({ ...order, items });
  }

  connection.release();
  res.json(results);
});

router.post('/', async (req, res) => {
  const { supplierId, items } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO orders (supplierId) VALUES (?)`,
      [supplierId]
    );
    const orderId = result.insertId;
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (orderId, productName, quantity) VALUES (?, ?, ?)`,
        [orderId, item.productName, item.quantity]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'הזמנה נשלחה לספק', orderId });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating order:', err);
    res.status(500).json({ message: 'שגיאה ביצירת ההזמנה' });
  } finally {
    connection.release();
  }
});


router.put('/:id/approve', async (req, res) => {
  const connection = await pool.getConnection();
  await connection.query(`UPDATE orders SET status = 'בתהליך' WHERE id = ?`, [req.params.id]);
  connection.release();
  res.json({ message: 'ההזמנה אושרה' });
});

router.put('/:id/complete', async (req, res) => {
  const orderId = req.params.id;
  try {
    const connection = await pool.getConnection();
    await connection.query(
      `UPDATE orders SET status = 'הושלמה' WHERE id = ?`,
      [orderId]
    );
    connection.release();
    res.json({ message: 'הזמנה עודכנה לסטטוס הושלמה' });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ message: 'שגיאה בעדכון סטטוס' });
  }
});


module.exports = router;
