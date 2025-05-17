const fs = require('fs');
const Database = require('better-sqlite3');
const db = new Database('database.db');

function readJsonFile(path) {
  try {
    const data = fs.readFileSync(path, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${path}:`, err);
    return [];
  }
}

const migration = db.transaction(() => {
  // Users
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (username, balance, tasks_completed, 
    referral_earnings, total_referrals, last_login, wallet_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const users = readJsonFile('public/data/users.json');
  users.forEach(user => {
    insertUser.run(
      user.username,
      user.balance || 0,
      JSON.stringify(user.tasks_completed || []),
      user.referral_earnings || 0,
      user.total_referrals || 0,
      user.last_login || new Date().toISOString(),
      user.wallet_address || null
    );
  });

  // Tasks
  const insertTask = db.prepare(`
    INSERT OR REPLACE INTO tasks (id, title, description, reward, completed_by)
    VALUES (?, ?, ?, ?, ?)
  `);

  const tasks = readJsonFile('public/data/tasks.json');
  tasks.forEach((task, index) => {
    insertTask.run(
      index + 1,
      task.title,
      task.description,
      task.reward,
      JSON.stringify(task.completed_by || [])
    );
  });

  // Referrals
  const insertReferral = db.prepare(`
    INSERT OR REPLACE INTO referrals (referrer, referred, timestamp)
    VALUES (?, ?, ?)
  `);

  const referrals = readJsonFile('public/data/referrals.json');
  referrals.forEach(ref => {
    insertReferral.run(
      ref.referrer,
      ref.referred,
      ref.timestamp || new Date().toISOString()
    );
  });

  // Withdrawals
  const insertWithdrawal = db.prepare(`
    INSERT OR REPLACE INTO withdrawals (username, amount, wallet_address, timestamp, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const withdrawals = readJsonFile('public/data/withdrawals.json');
  withdrawals.forEach(w => {
    insertWithdrawal.run(
      w.username,
      w.amount,
      w.wallet_address,
      w.timestamp || new Date().toISOString(),
      w.status || 'pending'
    );
  });

  // Texts
  const insertText = db.prepare(`
    INSERT OR REPLACE INTO texts (key, value)
    VALUES (?, ?)
  `);

  const texts = readJsonFile('public/data/text.json');
  Object.entries(texts).forEach(([key, value]) => {
    insertText.run(key, value);
  });
});

try {
  migration();
  console.log('Migration completed successfully');
} catch (err) {
  console.error('Migration failed:', err);
}
