import { saveToFile } from './utils.js';
import { updateUserData } from './userService.js';
import { showMessage } from './utils.js';

export async function handleWithdraw(username, currentBalance, walletAddress) {
    if (currentBalance === 0) {
        showMessage("Your balance is 0. Complete tasks to earn MEMEX!");
        return { success: false };
    }

    if (!walletAddress?.trim()) {
        showMessage("Please enter a valid wallet address");
        return { success: false };
    }

    const withdrawalData = {
        username,
        walletAddress: walletAddress.trim(),
        amount: currentBalance,
        timestamp: new Date().toISOString()
    };

    try {
        // Add withdrawal record
        const response = await fetch("/data/withdrawals.json");
        const withdrawals = await response.json();
        withdrawals.push(withdrawalData);
        await Promise.all([
            saveToFile("withdrawals.json", withdrawals),
            fetch("/api/save/withdrawals.json", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(withdrawals)
            })
        ]);
        
        // Get user data to preserve tasks
        const userResponse = await fetch("/data/users.json");
        const users = await userResponse.json();
        const user = users.find(u => u.username === username);
        
        // Update user with 0 balance but keep tasks
        if (user) {
            user.balance = 0;
            await saveToFile("users.json", users);
        }

        showMessage("Withdrawal successful!");
        return { success: true, newBalance: 0 };
    } catch (error) {
        console.error("Error processing withdrawal:", error);
        showMessage("Error processing withdrawal. Please try again.");
        return { success: false };
    }
}
