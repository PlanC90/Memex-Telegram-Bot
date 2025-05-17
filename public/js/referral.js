import { saveToFile } from './utils.js';

export async function handleReferral(referrer, referred) {
    try {
        // Check if referral already exists
        const referralsResponse = await fetch("/data/referrals.json");
        const referrals = await referralsResponse.json();
        
        if (referrals.some(r => r.referred === referred)) {
            console.log("User already referred");
            return { success: false, message: "User already referred" };
        }

        // Add new referral
        const newReferral = {
            referrer,
            referred,
            timestamp: new Date().toISOString()
        };
        referrals.push(newReferral);
        await saveToFile("referrals.json", referrals);

        // Update referrer's stats
        const usersResponse = await fetch("/data/users.json");
        const users = await usersResponse.json();
        const referrerUser = users.find(u => u.username === referrer);
        
        if (referrerUser) {
            const reward = 10000;
            referrerUser.balance = (referrerUser.balance || 0) + reward;
            referrerUser.referral_earnings = (referrerUser.referral_earnings || 0) + reward;
            referrerUser.total_referrals = (referrerUser.total_referrals || 0) + 1;
            
            // Save updated user data
            await saveToFile("users.json", users);
            console.log("Referral reward added:", reward);
            return { success: true, reward };
        }

        return { success: false, message: "Referrer not found" };
    } catch (error) {
        console.error("Error handling referral:", error);
        return { success: false, error: error.message };
    }
}

export async function loadReferralStats(username) {
    try {
        const usersResponse = await fetch("/data/users.json");
        const users = await usersResponse.json();
        const user = users.find(u => u.username === username);
        
        return {
            totalReferrals: user?.total_referrals || 0,
            totalEarnings: user?.referral_earnings || 0
        };
    } catch (error) {
        console.error("Error loading referral stats:", error);
        return { totalReferrals: 0, totalEarnings: 0 };
    }
}
