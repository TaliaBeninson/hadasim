const express = require('express');
const router = express.Router();

const adminUser = {
  username: 'admin',
  password: '1234'
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === adminUser.username && password === adminUser.password) {
    res.json({ message: 'התחברות הצליחה' });
  } else {
    res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
  }
});

module.exports = router;
