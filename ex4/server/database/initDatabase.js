const pool = require('./db');

async function initDatabase() {
  const connection = await pool.getConnection();

  await connection.query(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      companyName VARCHAR(100),
      phone VARCHAR(20),
      representativeName VARCHAR(100),
      password VARCHAR(100)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      supplierId INT,
      name VARCHAR(100),
      price FLOAT,
      minQuantity INT,
      FOREIGN KEY (supplierId) REFERENCES suppliers(id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplierId INT,
    status VARCHAR(50) DEFAULT 'ממתין לאישור',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplierId) REFERENCES suppliers(id)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId INT,
    productName VARCHAR(100),
    quantity INT,
    FOREIGN KEY (orderId) REFERENCES orders(id)
  )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS store_inventory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      productName VARCHAR(100) UNIQUE,
      quantity INT,
      minQuantity INT
    )
  `);  

  connection.release();
}

module.exports = initDatabase;
