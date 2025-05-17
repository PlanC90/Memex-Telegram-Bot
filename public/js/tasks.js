import { formatNumber } from './utils.js';
import { updateUserStats } from './userService.js';
import { loadTexts } from './textService.js';

export async function loadTasks(gameTasksDiv, completedTasks, referralLink, onComplete) {
    try {
        const [tasksResponse, textsResponse] = await Promise.all([
            fetch('/data/tasks.json'),
            loadTexts()
        ]);

        if (!tasksResponse.ok) {
            throw new Error(`HTTP error! status: ${tasksResponse.status}`);
        }

        const tasks = await tasksResponse.json();
        if (!Array.isArray(tasks)) {
            throw new Error('Tasks data is not an array');
        }

        const disclaimer = document.getElementById('disclaimer');
        if (disclaimer && textsResponse.disclaimer) {
            disclaimer.textContent = textsResponse.disclaimer;
        }

        gameTasksDiv.innerHTML = '';
        tasks.forEach(task => {
            const taskElement = createTaskElement(task, completedTasks, referralLink, onComplete);
            if (taskElement) {
                gameTasksDiv.appendChild(taskElement);
            }
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
        gameTasksDiv.innerHTML = '<p class="error">Error loading tasks. Please try again later.</p>';
    }
}

function createTaskElement(task, completedTasks, referralLink, onComplete) {
    const taskContainer = document.createElement("div");
    taskContainer.className = "task-container";

    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";

    const taskCounts = JSON.parse(localStorage.getItem(`taskCount_${task.id}`) || '0');
    const uniqueReferralLink = `${referralLink}?ref=${window.username}&t=${Date.now()}`;

    taskInfo.innerHTML = `
        <div class="task-title">
            ${getTaskIcon(task.type)} ${task.join}
        </div>
        <div class="task-reward">
            <i class="fas fa-gift"></i> Reward: ${formatNumber(parseInt(task.kazan))} MEMEX
        </div>
        ${task.type === 'tweet' || task.type === 'referral' ? 
            `<div class="task-progress">
                <i class="fas fa-chart-line"></i> Progress: ${taskCounts}/${task.maxRewards}
            </div>` : ''}
    `;

    const taskButton = document.createElement("button");
    taskButton.className = "task-button";

    if (task.type === "referral") {
        taskInfo.innerHTML += `
            <div class="referral-link">
                <input type="text" readonly value="${uniqueReferralLink}" class="referral-input">
                <button class="copy-link">
                    <i class="fas fa-copy"></i> Copy Link
                </button>
            </div>
        `;

        const copyButton = taskInfo.querySelector('.copy-link');
        copyButton.addEventListener('click', async () => {
            if (taskCounts < task.maxRewards) {
                await navigator.clipboard.writeText(uniqueReferralLink);
                alert("Link copied successfully!");
                setTimeout(() => {
                    incrementTaskCount(task.id);
                    processTaskReward(task.kazan, true);
                    updateTaskProgress(taskInfo, task.id, task.maxRewards);
                }, 300);
            }
        });

        taskButton.innerHTML = '<i class="fas fa-share-alt"></i> Share Now';
        taskButton.onclick = () => {
            if (taskCounts < task.maxRewards) {
                if (/android/i.test(navigator.userAgent)) {
                    window.open(`tg://msg?text=${encodeURIComponent('Join MEMEX Rewards and earn tokens! Use my referral link: ' + uniqueReferralLink)}`, '_blank');
                } else {
                    shareReferralLink(uniqueReferralLink);
                }
                setTimeout(() => {
                    incrementTaskCount(task.id);
                    processTaskReward(task.kazan, true);
                    updateTaskProgress(taskInfo, task.id, task.maxRewards);
                }, 300);
            }
        };
    } else if (task.type === "tweet") {
        if (taskCounts >= task.maxRewards) {
            taskButton.innerHTML = '<i class="fas fa-check"></i> Completed';
            taskButton.disabled = true;
            taskButton.classList.add("completed");
        } else {
            taskButton.innerHTML = '<i class="fab fa-twitter"></i> Tweet Now';
            taskButton.onclick = () => {
                const tweetText = task.tweetText?.replace("{referralLink}", uniqueReferralLink) || '';
                openTwitterWeb(tweetText);
                setTimeout(() => {
                    incrementTaskCount(task.id);
                    processTaskReward(task.kazan, false);
                    updateTaskProgress(taskInfo, task.id, task.maxRewards);
                    
                    if (taskCounts + 1 >= task.maxRewards) {
                        taskButton.innerHTML = '<i class="fas fa-check"></i> Completed';
                        taskButton.disabled = true;
                        taskButton.classList.add("completed");
                    }
                }, 60);
            };
        }
    } else {
        if (completedTasks.has(task.id.toString())) {
            taskButton.innerHTML = '<i class="fas fa-check"></i> Completed';
            taskButton.disabled = true;
            taskButton.classList.add("completed");
        } else {
            taskButton.innerHTML = '<i class="fas fa-check-circle"></i> Complete Task';
            taskButton.onclick = () => {
                if (task.mmx) {
                    window.open(task.mmx, '_blank');
                }
                onComplete(task, taskButton);
            };
        }
    }

    taskContainer.appendChild(taskInfo);
    taskContainer.appendChild(taskButton);
    return taskContainer;
}

function incrementTaskCount(taskId) {
    const currentCount = parseInt(localStorage.getItem(`taskCount_${taskId}`) || '0');
    const newCount = currentCount + 1;
    localStorage.setItem(`taskCount_${taskId}`, newCount.toString());
    return newCount;
}

async function processTaskReward(reward, isReferral) {
    try {
        const response = await fetch("/data/users.json");
        const users = await response.json();
        const user = users.find(u => u.username === window.username);

        if (user) {
            user.balance = (user.balance || 0) + parseInt(reward);
            if (isReferral) {
                user.referral_earnings = (user.referral_earnings || 0) + parseInt(reward);
                user.total_referrals = (user.total_referrals || 0) + 1;
            }

            await updateUserStats(user);
            updateBalanceDisplay(user.balance);
            updateStatsDisplay(user);
        }
    } catch (error) {
        console.error("Error processing task reward:", error);
    }
}

function updateTaskProgress(taskInfo, taskId, maxRewards) {
    const currentCount = parseInt(localStorage.getItem(`taskCount_${taskId}`) || '0');
    const progressElement = taskInfo.querySelector('.task-progress');
    if (progressElement) {
        progressElement.innerHTML = `<i class="fas fa-chart-line"></i> Progress: ${currentCount}/${maxRewards}`;
    }
}

function updateBalanceDisplay(balance) {
    const balanceElement = document.getElementById('user-balance');
    if (balanceElement) {
        balanceElement.textContent = `Balance: ${formatNumber(balance)} MEMEX`;
    }
}

function updateStatsDisplay(user) {
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) {
        const referralCountElement = statsContainer.querySelector('.stat-item:nth-child(3) .stat-value');
        const referralEarningsElement = statsContainer.querySelector('.stat-item:nth-child(4) .stat-value');
        
        if (referralCountElement) {
            referralCountElement.textContent = formatNumber(user.total_referrals || 0);
        }
        if (referralEarningsElement) {
            referralEarningsElement.textContent = formatNumber(user.referral_earnings || 0);
        }
    }
}

function openTwitterWeb(tweetText) {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(tweetUrl, '_blank');
}

function shareReferralLink(referralLink) {
    if (navigator.share) {
        navigator.share({
            title: 'Join MEMEX Rewards',
            text: 'Join MEMEX Rewards and earn tokens! Use my referral link:',
            url: referralLink
        }).catch(() => {
            navigator.clipboard.writeText(referralLink);
            alert("Link copied successfully!");
        });
    } else {
        navigator.clipboard.writeText(referralLink);
        alert("Link copied successfully!");
    }
}

function getTaskIcon(type) {
    const icons = {
        telegram: '<i class="fab fa-telegram"></i>',
        Exchange: '<i class="fas fa-exchange-alt"></i>',
        tweet: '<i class="fab fa-twitter"></i>',
        referral: '<i class="fas fa-users"></i>',
        'follow memex': '<i class="fab fa-twitter"></i>'
    };
    return icons[type] || '<i class="fas fa-tasks"></i>';
}
