async function simulateUsers() {
  const users = [];
  
  // Create 10 test users
  for(let i = 1; i <= 10; i++) {
    const username = `test${i.toString().padStart(2, '0')}`;
    try {
      // Create user
      const userData = {
        username,
        balance: 2000000, // 2M initial balance
        tasks_completed: ["1", "2"],
        referral_earnings: 0,
        total_referrals: 0,
        last_login: new Date().toISOString()
      };

      // Save user
      await fetch('/api/users/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      // Simulate withdrawal
      if (i % 2 === 0) { // Every second user makes a withdrawal
        const withdrawal = {
          username,
          walletAddress: `wallet${username}`,
          amount: 500000,
          timestamp: new Date().toISOString()
        };

        await fetch('/api/withdrawals/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(withdrawal)
        });
      }

      console.log(`Created user ${username} with initial balance:`, userData.balance);
      
    } catch(err) {
      console.error(`Error with user ${username}:`, err);
    }
  }

  // Verify all users
  const response = await fetch("/data/users.json");
  const allUsers = await response.json();
  console.log('All users:', allUsers);

  // Verify withdrawals
  const withdrawalsResponse = await fetch("/data/withdrawals.json");
  const allWithdrawals = await withdrawalsResponse.json();
  console.log('All withdrawals:', allWithdrawals);
}

// Export for use in browser console
window.simulateUsers = simulateUsers;
