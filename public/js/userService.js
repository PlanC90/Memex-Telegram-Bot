import { saveToFile } from './utils.js';

export async function loadUserData(username) {
    try {
        const response = await fetch("/data/users.json");
        const users = await response.json();
        const user = users.find(u => u.username === username);
        
        if (user) {
            return {
                balance: user.balance,
                tasksCompleted: new Set(user.tasks_completed),
                referralEarnings: user.referral_earnings || 0,
                totalReferrals: user.total_referrals || 0,
                last_login: new Date().toISOString()
            };
        } else {
            const newUser = {
                username,
                balance: 500000,
                tasks_completed: [],
                referral_earnings: 0,
                total_referrals: 0,
                last_login: new Date().toISOString()
            };
            users.push(newUser);
            
            try {
                const response = await fetch('/api/users/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(users)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                console.log(`[UserService] New user ${username} saved successfully`);
            } catch (error) {
                console.error('[UserService] Error saving new user:', error);
                throw error;
            }
            
            return {
                balance: newUser.balance,
                tasksCompleted: new Set(),
                referralEarnings: 0,
                totalReferrals: 0,
                last_login: newUser.last_login
            };
        }
    } catch (error) {
        console.error("[UserService] Error loading user data:", error);
        throw error;
    }
}

export async function updateUserStats(username, stats) {
    try {
        if (!username || !stats) {
            throw new Error('Invalid parameters');
        }
        
        const response = await fetch("/data/users.json");
        if (!response.ok) {
            throw new Error('Failed to fetch users data');
        }
        
        const users = await response.json();
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex !== -1) {
            users[userIndex] = {
                ...users[userIndex],
                ...stats,
                tasks_completed: Array.from(stats.tasksCompleted || users[userIndex].tasks_completed),
                balance: stats.balance || users[userIndex].balance,
                last_login: new Date().toISOString()
            };
            
            try {
                await fetch('/save/users.json', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(users)
                });
                console.log(`[UserService] User ${username} stats updated successfully`);
                return true;
            } catch (error) {
                console.error('[UserService] Error saving user stats:', error);
                return false;
            }
        }
        return false;
    } catch (error) {
        console.error("[UserService] Error updating user stats:", error);
        throw error;
    }
}

export async function updateUserBalance(username, newBalance) {
    try {
        const response = await fetch("/data/users.json");
        const users = await response.json();
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex !== -1) {
            users[userIndex].balance = newBalance;
            users[userIndex].last_updated = new Date().toISOString();
            
            try {
                await Promise.all([
                    saveToFile("users.json", users),
                    saveToFile("/data/users.json", users)
                ]);
                console.log(`[UserService] User ${username} balance updated successfully`);
                return true;
            } catch (error) {
                console.error('[UserService] Error saving user balance:', error);
                return false;
            }
        }
        return false;
    } catch (error) {
        console.error("[UserService] Error updating user balance:", error);
        throw error;
    }
}
