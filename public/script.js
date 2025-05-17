// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;
let username = "guest";
let userBalance = 500000;
let profilePicUrl = "/default-avatar.png";
let completedTasks = new Set();
let stats = { users: 0, totalEarned: 0, totalWithdrawn: 0, referralEarnings: 0 };
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
const smileEmoji = "😊";

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get username and profile picture from Telegram WebApp
async function initUser() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlUsername = urlParams.get("username");
    const referrer = urlParams.get("ref");
    
    if (urlUsername) {
        username = urlUsername;
    }
    
    if (tg.initDataUnsafe?.user) {
        username = tg.initDataUnsafe.user.username || username;
        profilePicUrl = tg.initDataUnsafe.user.photo_url || "/default-avatar.png";
    }

    // Generate bot referral link
    referralLink = `https://t.me/mmx_memex_bot?start=${username}`;

    if (referrer && referrer !== username) {
        await handleReferral(referrer);
    }

    await loadUserData();
    await loadStats();
    updateUI();
    setupWalletDownload();
}

// Handle referral
async function handleReferral(referrer) {
    try {
        const response = await fetch('/track-referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referrer, referred: username })
        });
        
        const data = await response.json();
        if (data.success) {
            const users = await (await fetch("/data/users.json")).json();
            const referrerUser = users.find(u => u.username === referrer);
            if (referrerUser) {
                referrerUser.balance += data.reward;
                referrerUser.referral_earnings = (referrerUser.referral_earnings || 0) + data.reward;
                await saveToFile("users.json", users);
            }
        }
    } catch (error) {
        console.error("Error handling referral:", error);
    }
}

// Complete task
async function completeTask(task, button) {
    if (completedTasks.has(task.id.toString())) {
        return;
    }

    if (task.mmx) {
        window.open(task.mmx, '_blank');
    }

    try {
        const reward = parseInt(task.kazan);
        userBalance += reward;
        completedTasks.add(task.id.toString());
        
        button.textContent = "Completed";
        button.disabled = true;
        button.classList.add("completed");
        
        await updateUserData();
        updateUI();
    } catch (error) {
        console.error("Error completing task:", error);
    }
}

// Load user data
async function loadUserData() {
    try {
        const response = await fetch("/data/users.json");
        const users = await response.json();
        const user = users.find(u => u.username === username);
        
        if (user) {
            userBalance = user.balance;
            completedTasks = new Set(user.tasks_completed);
            stats.referralEarnings = user.referral_earnings || 0;
        } else {
            const newUser = {
                username,
                balance: 500000,
                tasks_completed: [],
                referral_earnings: 0,
                last_login: new Date().toISOString()
            };
            users.push(newUser);
            await saveToFile("users.json", users);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

// Load stats
async function loadStats() {
    try {
        const [users, withdrawals, referrals] = await Promise.all([
            fetch("/data/users.json").then(r => r.json()),
            fetch("/data/withdrawals.json").then(r => r.json()),
            fetch("/data/referrals.json").then(r => r.json())
        ]);

        stats.users = users.length;
        stats.totalEarned = users.reduce((sum, user) => sum + (user.balance || 0), 0);
        stats.totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
        stats.referralEarnings = referrals
            .filter(r => r.referrer === username)
            .length * 50000;
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}

// Create task element
function createTaskElement(task) {
    const taskContainer = document.createElement("div");
    taskContainer.className = "task-container";
    
    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";
    
    if (task.type === "referral") {
        taskInfo.innerHTML = `
            <div class="task-title">${task.join}</div>
            <div class="task-description">${task.description}</div>
            <div class="task-reward">Reward: ${formatNumber(parseInt(task.kazan))} MEMEX per referral</div>
            <div class="referral-link">
                <input type="text" readonly value="${referralLink}" class="referral-input">
                <button class="copy-link" onclick="copyReferralLink()">Copy Link</button>
            </div>
        `;
    } else if (task.type === "smile") {
        taskInfo.innerHTML = `
            <div class="task-title">${task.join}</div>
            <div class="task-reward">Reward: ${formatNumber(parseInt(task.kazan))} MEMEX</div>
            <button class="copy-emoji" onclick="copyEmoji('${smileEmoji}')">Copy ${smileEmoji}</button>
        `;
    } else {
        taskInfo.innerHTML = `
            <div class="task-title">${task.join}</div>
            <div class="task-reward">Reward: ${formatNumber(parseInt(task.kazan))} MEMEX</div>
        `;
    }
    
    const taskButton = document.createElement("button");
    taskButton.className = "task-button";
    
    if (task.type === "referral") {
        taskButton.textContent = "Share Now";
        taskButton.onclick = () => shareReferralLink();
    } else {
        if (completedTasks.has(task.id.toString())) {
            taskButton.textContent = "Completed";
            taskButton.disabled = true;
            taskButton.classList.add("completed");
        } else {
            taskButton.textContent = "Complete Task";
            taskButton.onclick = () => completeTask(task, taskButton);
        }
    }
    
    taskContainer.appendChild(taskInfo);
    taskContainer.appendChild(taskButton);
    return taskContainer;
}

// Copy referral link
function copyReferralLink() {
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied to clipboard!");
}

// Share referral link
function shareReferralLink() {
    if (navigator.share) {
        navigator.share({
            title: 'Join MEMEX Rewards',
            text: 'Join MEMEX Rewards and earn tokens! Use my referral link:',
            url: referralLink
        });
    } else {
        copyReferralLink();
    }
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
            <span class="stat-value">${formatNumber(stats.referralEarnings)}</span>
            <span class="stat-label">Your Referral Earnings</span>
        </div>
    `;
}

// Update UI
function updateUI() {
    userInfoDiv.textContent = `Welcome @${username}🎉`;
    profilePic.src = profilePicUrl;
    userBalanceSpan.textContent = `Balance: ${formatNumber(userBalance)} MEMEX`;
    withdrawButton.classList.toggle('disabled', userBalance === 0);
    loadTasks();
    updateStatsUI();
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

    const withdrawalData = {
        username,
        walletAddress,
        amount: userBalance,
        timestamp: new Date().toISOString()
    };

    try {
        const withdrawals = await (await fetch("/data/withdrawals.json")).json();
        withdrawals.push(withdrawalData);
        await saveToFile("withdrawals.json", withdrawals);
        
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

// Update user data
async function updateUserData() {
    try {
        const response = await fetch("/data/users.json");
        const users = await response.json();
        const userIndex = users.findIndex(u => u.username === username);
        
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

// Setup wallet download
function setupWalletDownload() {
    downloadWalletButton.addEventListener('click', () => {
        const userAgent = navigator.userAgent.toLowerCase();
        let downloadUrl = '';

        if (/android/.test(userAgent)) {
            downloadUrl = 'https://play.google.com/store/apps/details?id=io.electraprotocol.xepwallet';
        } else if (/iphone|ipad|ipod/.test(userAgent)) {
            downloadUrl = 'https://apps.apple.com/us/app/xep-wallet/id1568558714';
        } else if (/win/.test(userAgent)) {
            downloadUrl = 'https://github.com/ElectraProtocol/XEP-Core/releases/download/v1.0.5.0/Win64-1.0.5.0-setup.exe';
        } else if (/mac/.test(userAgent)) {
            downloadUrl = 'https://github.com/ElectraProtocol/XEP-Core/releases/download/v1.0.5.0/MacOS_1.0.5.0_QT.dmg';
        }

        if (downloadUrl) {
            window.open(downloadUrl, '_blank');
        }
    });
}

// Event listeners
withdrawButton.addEventListener("click", handleWithdraw);

// Initialize the app
initUser();
