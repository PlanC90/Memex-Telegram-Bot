const db = require('./databaseService');

async function getStats() {
  try {
    // Get stats from SQLite
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(balance + referral_earnings) as total_memex,
        SUM(total_referrals) as total_referrals,
        SUM(referral_earnings) as referral_earnings
      FROM users
    `);
    
    const stats = stmt.get();
    return {
      total_users: stats.total_users || 0,
      total_memex: stats.total_memex || 0, 
      total_referrals: stats.total_referrals || 0,
      referral_earnings: stats.referral_earnings || 0
    };
  } catch (error) {
    console.error('Stats service error:', error);
    return {
      total_users: 0,
      total_memex: 0,
      total_referrals: 0,
      referral_earnings: 0
    };
  }
}

module.exports = { getStats };
