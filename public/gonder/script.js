import { loadTasks } from './tasks.js';
import { handleReferral, loadReferralStats } from './referral.js';
import { handleWithdrawal } from './withdrawals.js';
import { loadStats } from './stats.js';
import { setupWalletDownload } from './wallet.js';
import { formatNumber } from './utils.js';

// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
window.username = "guest";
let userBalance = 500000;
let profilePicUrl = "/default-avatar.png";
let completedTasks = new Set();
let stats = { users: 0, totalEarned: 0, totalWithdrawn: 0, referralEarnings: 0, referralCount: 0 };
let referralLink = "";

// DOM Elements
const userInfoDiv = document.getElementById("username");
const profilePic = document.getElementById("profile-pic");
const userBalanceSpan = document.getElementById("user-balance");
const gameTasksDiv = document.getElementById("game-tasks");
const walletInput = document.getElementById("wallet-address");
const withdrawButton = document.getElementById("withdraw-button");
const downloadWalletButton = document.getElementById("download-wallet");
const statsContainer = document.getElementById("stats-container");

// Load user data
async function loadUserData() {
    try {
        const response = await fetch("/data/users.json");
        const users = await response.json();
        const user = users.find(u => u.username === window.username);

        if (user) {
            userBalance = user.balance;
            completedTasks = new Set(user.tasks_completed);
            stats.referralEarnings = user.referral_earnings || 0;
            stats.referralCount = user.total_referrals || 0;
        } else {
            const newUser = {
                username: window.username,
                balance: 500000,
                tasks_completed: [],
                referral_earnings: 0,
                total_referrals: 0,
                last_login: new Date().toISOString()
            };
            users.push(newUser);
            await saveToFile("users.json", users);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

// Initialize user data
async function initUser() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlUsername = urlParams.get("username");
        const referrer = urlParams.get("ref");

        if (urlUsername && urlUsername !== 'null' && urlUsername !== 'undefined') {
            window.username = urlUsername;
        }

        if (tg.initDataUnsafe?.user) {
            window.username = tg.initDataUnsafe.user.username || window.username;
            profilePicUrl = tg.initDataUnsafe.user.photo_url || "/default-avatar.png";
        }

        referralLink = `https://t.me/mmx_memex_bot?start=${window.username}`;

        await loadUserData();

        if (referrer && referrer !== window.username) {
            await handleReferral(referrer, window.username);
            await loadUserData(); // Refresh data after referral processing
        }

        const [globalStats, referralStats] = await Promise.all([ 
            loadStats(),
            loadReferralStats(window.username)
        ]);

        stats = {
            ...globalStats,
            referralCount: referralStats.totalReferrals,
            referralEarnings: referralStats.totalEarnings
        };

        await loadTasks(gameTasksDiv, completedTasks, referralLink, completeTask);
        updateUI();
        setupWalletDownload(downloadWalletButton);
    } catch (error) {
        console.error("Error initializing user:", error);
    }
}

// Complete task
async function completeTask(task, button) {
    if (completedTasks.has(task.id.toString()) && task.type !== "referral" && task.type !== "tweet") {
        return;
    }

    try {
        const reward = parseInt(task.kazan);
        userBalance += reward;

        if (task.type !== "referral" && task.type !== "tweet") {
            completedTasks.add(task.id.toString());
            button.innerHTML = '<i class="fas fa-check"></i> Completed';
            button.disabled = true;
            button.classList.add("completed");
        }

        await updateUserData();
        updateUI();
    } catch (error) {
        console.error("Error completing task:", error);
    }
}

// Update user data
async function updateUserData() {
    try {
        const response = await fetch("/data/users.json");
        const users = await response.json();
        const userIndex = users.findIndex(u => u.username === window.username);

        if (userIndex !== -1) {
            users[userIndex].balance = userBalance;
            users[userIndex].tasks_completed = Array.from(completedTasks);
            users[userIndex].last_login = new Date().toISOString();
            await saveToFile("users.json", users);
        }
    } catch (error) {
        console.error("Error updating user data:", error);
    }
}

// Update UI
function updateUI() {
    userInfoDiv.textContent = `Welcome @${window.username}🎉`;
    profilePic.src = profilePicUrl;
    userBalanceSpan.textContent = `Balance: ${formatNumber(userBalance)} MEMEX`;
    withdrawButton.classList.toggle('disabled', userBalance === 0);
    updateStatsUI();
}

// Update stats UI
function updateStatsUI() {
    statsContainer.innerHTML = `
        <div class="stat-item">
            <span class="stat-value">${formatNumber(stats.users)}</span>
            <span class="stat-label">Total Users</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${formatNumber(stats.totalEarned)}</span>
            <span class="stat-label">Total MEMEX Distributed</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${formatNumber(stats.referralCount)}</span>
            <span class="stat-label">Your Total Referrals</span>
        </div>
        <div class="stat-item">
            <span class="stat-value">${formatNumber(stats.referralEarnings)}</span>
            <span class="stat-label">Your Referral Earnings</span>
        </div>
    `;
}

// Handle withdrawal
async function handleWithdraw() {
    if (userBalance === 0) {
        alert("Your balance is 0. Complete tasks to earn MEMEX!");
        return;
    }

    const walletAddress = walletInput.value.trim();
    if (!walletAddress) {
        alert("Please enter a valid wallet address");
        return;
    }

    try {
        await handleWithdrawal(window.username, userBalance, walletAddress);
        userBalance = 0;
        await updateUserData();
        updateUI();
        alert("Withdrawal successful!");
        walletInput.value = "";
    } catch (error) {
        console.error("Error processing withdrawal:", error);
        alert("Error processing withdrawal. Please try again.");
    }
}

// Save data to file
async function saveToFile(fileName, data) {
    try {
        await fetch(`/save/${fileName}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error(`Error saving ${fileName}:`, error);
    }
}

// Event listeners
withdrawButton.addEventListener("click", handleWithdraw);

// Initialize the app
initUser();
