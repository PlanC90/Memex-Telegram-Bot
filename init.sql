CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  balance INTEGER DEFAULT 500000,
  tasks_completed TEXT DEFAULT '[]',
  referral_earnings INTEGER DEFAULT 0,
  total_referrals INTEGER DEFAULT 0,
  last_login TEXT,
  wallet_address TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
  title TEXT,
  description TEXT,
  reward INTEGER,
  completed_by TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY,
  referrer TEXT,
  referred TEXT,
  timestamp TEXT,
  FOREIGN KEY(referrer) REFERENCES users(username),
  FOREIGN KEY(referred) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id INTEGER PRIMARY KEY,
  username TEXT,
  amount INTEGER,
  wallet_address TEXT,
  timestamp TEXT,
  status TEXT DEFAULT 'pending',
  FOREIGN KEY(username) REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS texts (
  id INTEGER PRIMARY KEY,
  key TEXT UNIQUE,
  value TEXT
);
