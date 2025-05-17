import { saveToFile } from './utils.js';

export async function handleWithdrawal(username, amount, walletAddress) {
    if (amount === 0) {
        const errorMessage = "Your balance is 0. Complete tasks to earn MEMEX!";
        console.error(errorMessage);  // Hata konsola yazılır
        throw new Error(errorMessage);  // Hata kullanıcıya gösterilir
    }

    // Sadece 'x' ile başlayan geçerli bir adresi kabul et
    if (typeof walletAddress !== 'string' || walletAddress.trim() === '' || 
        !walletAddress.startsWith("x")) {
        const errorMessage = "Please enter a valid Omnixep wallet address. If you don't have one, you can obtain it by clicking the 'Download Wallet' link.";
        console.error(errorMessage);  // Hata konsola yazılır
        throw new Error(errorMessage);  // Hata kullanıcıya gösterilir
    }

    const withdrawalData = {
        username,
        walletAddress,
        amount,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch("/data/withdrawals.json");

        if (!response.ok) {
            const errorMessage = "Unable to fetch withdrawal data. Please try again.";
            console.error(errorMessage);  // Hata konsola yazılır
            throw new Error(errorMessage);  // Hata kullanıcıya gösterilir
        }

        const withdrawals = await response.json();
        withdrawals.push(withdrawalData);

        try {
            await saveToFile("withdrawals.json", withdrawals);
        } catch (fileError) {
            const errorMessage = "There was an error saving the withdrawal data. Please try again.";
            console.error("Error saving to file:", fileError);  // Hata konsola yazılır
            throw new Error(errorMessage);  // Hata kullanıcıya gösterilir
        }

        return true;
    } catch (error) {
        console.error("Please enter a valid Omnixep wallet address:", error);  // Hata konsola yazılır
        // Burada belirtilen hata mesajı gösterilecek
        throw new Error("Please enter a valid Omnixep wallet address. If you don't have one, you can obtain it by clicking the 'Download Wallet' link.");
    }
}
