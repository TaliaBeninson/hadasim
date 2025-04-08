const express = require('express');
const router = express.Router();
const pool = require('../database/db');

router.get('/', async (req, res) => {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM store_inventory ORDER BY productName');
    connection.release();
    res.json(rows);
});

router.post('/', async (req, res) => {
    const { productName, quantity, minQuantity } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.query(`
        INSERT INTO store_inventory (productName, quantity, minQuantity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          quantity = VALUES(quantity),
          minQuantity = VALUES(minQuantity)
      `, [productName, quantity, minQuantity]);

        res.status(201).json({ message: 'המוצר עודכן/נוסף' });
    } catch (err) {
        console.error('שגיאה בעדכון מלאי:', err);
        res.status(500).json({ message: 'שגיאה בשמירת הסחורה' });
    } finally {
        connection.release();
    }
});

router.post('/updateFromPOS', async (req, res) => {
    const soldItems = req.body;
    const connection = await pool.getConnection();

    try {
        for (const [productName, soldQuantity] of Object.entries(soldItems)) {
            await connection.query(
                `UPDATE store_inventory SET quantity = quantity - ? WHERE productName = ?`,
                [soldQuantity, productName]
            );

            const [inventory] = await connection.query(`
            SELECT quantity, minQuantity FROM store_inventory WHERE productName = ?
            `, [productName]);

                if (inventory[0] && inventory[0].quantity < inventory[0].minQuantity) {
                    const [suppliers] = await connection.query(`
                SELECT s.id AS supplierId
                FROM suppliers s
                JOIN products p ON s.id = p.supplierId
                WHERE p.name = ?
                ORDER BY p.price ASC
                LIMIT 1
            `, [productName]);

                if (suppliers.length > 0) {
                    const bestSupplier = suppliers[0];

                    const [insertOrder] = await connection.query(
                        `INSERT INTO orders (supplierId) VALUES (?)`,
                        [bestSupplier.supplierId]
                    );

                    const orderId = insertOrder.insertId;

                    const minQuantity = inventory[0].minQuantity;

                    await connection.query(`
                        INSERT INTO order_items (orderId, productName, quantity)
                        VALUES (?, ?, ?)`,
                        [orderId, productName, minQuantity]
                    );

                    await connection.query(`
                        UPDATE store_inventory
                        SET quantity = quantity + ?
                        WHERE productName = ?
                        `, [minQuantity, productName]);

                    console.log(`בוצעה הזמנה אוטומטית ל-${productName}`);
                } else {
                    console.warn(`אין ספק עבור המוצר ${productName}`);
                }
            }
        }


        res.status(200).json({ message: 'המלאי עודכן בהצלחה מהקופה' });
    } catch (err) {
        console.error('שגיאה בעדכון מהמכירה:', err);
        res.status(500).json({ message: 'שגיאה בעדכון המלאי' });
    } finally {
        connection.release();
    }
});

module.exports = router;
