import fs from 'fs/promises';
import path from 'path';

async function checkAndUpdateBalances() {
    try {
        // Read both files
        const withdrawalsPath = path.resolve(process.cwd(), 'public/data/withdrawals.json');
        const usersPath = path.resolve(process.cwd(), 'public/data/users.json');
        
        const [withdrawals, users] = await Promise.all([
            fs.readFile(withdrawalsPath, 'utf8').then(JSON.parse),
            fs.readFile(usersPath, 'utf8').then(JSON.parse)
        ]);

        let hasUpdates = false;
        
        // Update user balances
        for (const withdrawal of withdrawals) {
            const userIndex = users.findIndex(u => u.username === withdrawal.username);
            if (userIndex !== -1) {
                users[userIndex].balance = 0;
                hasUpdates = true;
            }
        }

        // Save updates if any changes were made
        if (hasUpdates) {
            // Save to both data directories
            const paths = [
                path.resolve(process.cwd(), 'data/users.json'),
                path.resolve(process.cwd(), 'public/data/users.json'),
                usersPath
            ];

            const withdrawalPaths = [
                path.resolve(process.cwd(), 'data/withdrawals.json'),
                path.resolve(process.cwd(), 'public/data/withdrawals.json')
            ];

            // Save users
            await Promise.all(paths.map(path => 
                fs.writeFile(path, JSON.stringify(users, null, 2), 'utf8')
            ));

            // Save withdrawals
            await Promise.all(withdrawalPaths.map(path => 
                fs.writeFile(path, JSON.stringify(withdrawals, null, 2), 'utf8')
            ));
            
            console.log('[WithdrawalCheck] Updated user balances and synced withdrawals');
        }

    } catch (error) {
        console.error('[WithdrawalCheck] Error:', error);
    }
}

// Run check every 5 minutes
setInterval(checkAndUpdateBalances, 5 * 60 * 1000);

// Initial check on startup
checkAndUpdateBalances();

export default checkAndUpdateBalances;
