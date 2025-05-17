export async function loadStats() {
    try {
        const [users, withdrawals, referrals] = await Promise.all([
            fetch("/data/users.json").then(r => r.json()),
            fetch("/data/withdrawals.json").then(r => r.json()),
            fetch("/data/referrals.json").then(r => r.json())
        ]);

        return {
            users: users.length,
            totalEarned: users.reduce((sum, user) => sum + (user.balance || 0), 0),
            totalWithdrawn: withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0)
        };
    } catch (error) {
        console.error("Error loading stats:", error);
        return { users: 0, totalEarned: 0, totalWithdrawn: 0 };
    }
}

export async function loadReferralStats(username) {
    try {
        const [referralsResponse, usersResponse] = await Promise.all([
            fetch("/data/referrals.json"),
            fetch("/data/users.json")
        ]);
        
        const [referrals, users] = await Promise.all([
            referralsResponse.json(),
            usersResponse.json()
        ]);
        
        const userReferrals = referrals.filter(r => r.referrer === username);
        const user = users.find(u => u.username === username);
        
        return {
            count: userReferrals.length,
            earnings: user?.referral_earnings || 0
        };
    } catch (error) {
        console.error("Error loading referral stats:", error);
        return { count: 0, earnings: 0 };
    }
}
