import { saveData } from './dataService.js';
import path from 'path';
import fs from 'fs/promises';

export async function handleReferral(referrer, referred) {
    try {
        const dataPath = path.join(process.cwd(), 'public', 'data');
        
        // Read referral data
        const referralsPath = path.join(dataPath, 'referrals.json');
        const referralsData = JSON.parse(await fs.readFile(referralsPath, 'utf-8'));
        
        // Read user data
        const usersPath = path.join(dataPath, 'users.json');
        const usersData = JSON.parse(await fs.readFile(usersPath, 'utf-8'));

        // Check if user was previously referred
        const existingReferral = referralsData.find(
            r => r.referred === referred
        );

        if (!existingReferral) {
            // Add new referral
            referralsData.push({
                referrer,
                referred,
                timestamp: new Date().toISOString()
            });
            await saveData('referrals.json', referralsData);

            // Reward referrer
            const referrerUser = usersData.find(u => u.username === referrer);
            if (referrerUser) {
                const rewardAmount = 10000; // Standard reward amount
                referrerUser.balance += rewardAmount;
                referrerUser.referral_earnings = (referrerUser.referral_earnings || 0) + rewardAmount;
                await saveData('users.json', usersData);
            }

            return { success: true, reward: 60000 };
        }

        return { success: false, message: 'User already referred' };
    } catch (error) {
        console.error('Referral error:', error);
        throw error;
    }
}
