const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../../database.db'), { 
  verbose: console.log,
  fileMustExist: true
});

// Performans ve güvenlik optimizasyonları
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('temp_store = MEMORY');
db.pragma('cache_size = -2000');
db.pragma('foreign_keys = ON');

module.exports = {
  getUser: (username) => {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? LIMIT 1');
    return stmt.get(username);
  },

  createUser: (username) => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO users (username, last_login) 
      VALUES (?, datetime('now'))
    `);
    return stmt.run(username);
  },

  updateUser: (user) => {
    const stmt = db.prepare(`
      UPDATE users SET 
        balance = ?,
        tasks_completed = ?,
        referral_earnings = ?,
        total_referrals = ?,
        last_login = datetime('now'),
        wallet_address = ?
      WHERE username = ?
    `);
    
    return stmt.run(
      user.balance,
      JSON.stringify(user.tasks_completed),
      user.referral_earnings,
      user.total_referrals,
      user.wallet_address, 
      user.username
    );
  }
};
