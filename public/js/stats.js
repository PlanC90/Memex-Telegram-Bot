export async function loadStats() {
    try {
        const [users, withdrawals, referrals] = await Promise.all([
            fetch("/data/users.json").then(r => r.json()),
            fetch("/data/withdrawals.json").then(r => r.json()),
            fetch("/data/referrals.json").then(r => r.json())
        ]);

        const currentUser = users.find(u => u.username === window.username);

        return {
            users: users.length,
            totalEarned: users.reduce((sum, user) => sum + (user.balance || 0), 0),
            totalWithdrawn: withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0),
            referralCount: currentUser?.total_referrals || 0,
            referralEarnings: currentUser?.referral_earnings || 0
        };
    } catch (error) {
        console.error("Error loading stats:", error);
        return { 
            users: 0, 
            totalEarned: 0, 
            totalWithdrawn: 0,
            referralCount: 0,
            referralEarnings: 0 
        };
    }
}
