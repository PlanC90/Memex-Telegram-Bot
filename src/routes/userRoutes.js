const express = require('express');
const router = express.Router();
const db = require('../services/databaseService');

router.get('/users/:username', (req, res) => {
  try {
    const user = db.getUser(req.params.username);
    if (!user) {
      db.createUser(req.params.username);
      res.json({
        balance: 500000,
        tasks_completed: [],
        referral_earnings: 0,
        total_referrals: 0
      });
    } else {
      res.json(user);
    }
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;
