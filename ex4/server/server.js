const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const initDatabase = require('./database/initDatabase');
const path = require('path');

const supplierRoutes = require('./routes/supplier');
const ordersRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/supplier', supplierRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/inventory', inventoryRoutes);

app.use(express.static(path.join(__dirname, '../client')));

initDatabase().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
