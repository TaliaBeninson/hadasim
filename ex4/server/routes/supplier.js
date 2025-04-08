const express = require('express');
const router = express.Router();
const pool = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT id, companyName FROM suppliers');
    connection.release();
    res.json(rows);
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ message: 'שגיאה בטעינת הספקים' });
  }
});

router.get('/:id/products', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT name, price, minQuantity FROM products WHERE supplierId = ?',
      [req.params.id]
    );
    connection.release();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'שגיאה בטעינת הסחורה' });
  }
});

router.get('/all-products', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(`SELECT name FROM products`);
    res.json(rows.map(r => r.name));
  } catch (err) {
    console.error('שגיאה בשליפת מוצרים:', err);
    res.status(500).json({ message: 'שגיאה בטעינת מוצרים' });
  } finally {
    connection.release();
  }
});


router.post('/register', async (req, res) => {
  const { companyName, phone, representativeName, password, products } = req.body;
  try {
    const connection = await pool.getConnection();

    const [supplierResult] = await connection.query(
      `INSERT INTO suppliers (companyName, phone, representativeName, password)
       VALUES (?, ?, ?, ?)`,
      [companyName, phone, representativeName, password]
    );

    const supplierId = supplierResult.insertId;

    if (Array.isArray(products) && products.length > 0) {
      const values = products.map(p => [supplierId, p.name, p.price, p.minQuantity]);
      await connection.query(
        `INSERT INTO products (supplierId, name, price, minQuantity) VALUES ?`,
        [values]
      );
    }

    connection.release();
    res.status(201).json({ message: 'Supplier registered', supplierId });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/login', async (req, res) => {
  const { phone, password } = req.body;
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id FROM suppliers WHERE phone = ? AND password = ?',
      [phone, password]
    );
    connection.release();

    if (rows.length === 0)
      return res.status(401).json({ message: 'טלפון או סיסמה שגויים' });

    res.json({ message: 'התחברת בהצלחה', supplierId: rows[0].id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
