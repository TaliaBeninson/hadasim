This is a simple grocery store management system built with Node.js and MySQL.  
It includes:

- Supplier registration and login
- Store owner login
- Product & order management
- Inventory system
- Automatic ordering when stock is low (via POS)

How to Run the Project

1. Make sure you have Node.js and MySQL installed.
2. Create a database named `grocery_db`.
3. In `server/database/db.js`, update your MySQL credentials
4. Open terminal in the root folder and run:
    npm install
    node server.js
5. Open your browser at http://localhost:3000


Use these credentials to log in as the store owner:
Username: admin
Password: 1234

You can simulate a sale using Postman to trigger automatic restocking.
URL: http://localhost:3000/api/inventory/updateFromPOS
Method: POST
Headers: Content-Type: application/json
Body (raw JSON): {"product_name": quantity}
