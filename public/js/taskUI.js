import { formatNumber } from './utils.js';
import { handleReferral } from './referralService.js';

export function createTaskElement(task, completedTasks, referralLink, onComplete) {
    const taskContainer = document.createElement("div");
    taskContainer.className = "task-container";
    
    const taskInfo = document.createElement("div");
    taskInfo.className = "task-info";
    
    const taskCounts = JSON.parse(localStorage.getItem('taskCounts') || '{}');
    const currentCount = taskCounts[task.id] || 0;
    const maxCount = task.type === 'tweet' || task.type === 'referral' ? 100 : 1;
    const uniqueReferralLink = `${referralLink}?ref=${window.username}&t=${Date.now()}`;
    
    if (task.type === "referral") {
        taskInfo.innerHTML = `
            <div class="task-title">
                <i class="fas fa-users"></i> ${task.join}
            </div>
            <div class="task-description">
                <i class="fas fa-info-circle"></i> ${task.description}
            </div>
            <div class="task-reward">
                <i class="fas fa-gift"></i> Reward: ${formatNumber(parseInt(task.kazan))} MEMEX per referral
            </div>
            <div class="task-progress">
                <i class="fas fa-chart-line"></i> Progress: ${currentCount}/${maxCount}
            </div>
            <div class="referral-link">
                <input type="text" readonly value="${uniqueReferralLink}" class="referral-input">
                <button class="copy-link">
                    <i class="fas fa-copy"></i> Copy Link
                </button>
            </div>
        `;
        
        const copyButton = taskInfo.querySelector('.copy-link');
        copyButton.addEventListener('click', async () => {
            await navigator.clipboard.writeText(uniqueReferralLink);
            alert("Link copied successfully!");
            setTimeout(async () => {
                await handleReferral(window.username, 'new_referral');
                incrementTaskCount(task.id);
                updateTaskProgress(taskInfo, task.id);
            }, 60000);
        });
    } else if (task.type === "tweet") {
        const tweetText = task.tweetText.replace("{referralLink}", uniqueReferralLink);
        taskInfo.innerHTML = `
            <div class="task-title">
                <i class="fab fa-twitter"></i> ${task.join}
            </div>
            <div class="task-reward">
                <i class="fas fa-gift"></i> Reward: ${formatNumber(parseInt(task.kazan))} MEMEX
            </div>
            <div class="task-progress">
                <i class="fas fa-chart-line"></i> Progress: ${currentCount}/${maxCount}
            </div>
            <div class="tweet-text">
                <i class="fas fa-quote-left"></i> ${tweetText}
            </div>
        `;
    }
    
    const taskButton = document.createElement("button");
    taskButton.className = "task-button";
    
    if (task.type === "referral") {
        taskButton.innerHTML = '<i class="fas fa-share-alt"></i> Share Now';
        taskButton.onclick = () => {
            if (/android/i.test(navigator.userAgent)) {
                const telegramUrl = `tg://msg?text=${encodeURIComponent('Join MEMEX Rewards and earn tokens! Use my referral link: ' + uniqueReferralLink)}`;
                window.location.href = telegramUrl;
            } else {
                shareReferralLink(uniqueReferralLink);
            }
            setTimeout(async () => {
                await handleReferral(window.username, 'new_referral');
                incrementTaskCount(task.id);
                updateTaskProgress(taskInfo, task.id);
            }, 60000);
        };
    } else if (task.type === "tweet") {
        if (currentCount >= maxCount) {
            taskButton.innerHTML = '<i class="fas fa-check"></i> Completed';
            taskButton.disabled = true;
            taskButton.classList.add("completed");
        } else {
            taskButton.innerHTML = '<i class="fab fa-twitter"></i> Tweet Now';
            taskButton.onclick = () => {
                const tweetText = task.tweetText.replace("{referralLink}", uniqueReferralLink);
                if (/android/i.test(navigator.userAgent)) {
                    const twitterAppUrl = `twitter://post?text=${encodeURIComponent(tweetText)}`;
                    const webUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
                    
                    try {
                        window.location.href = twitterAppUrl;
                        setTimeout(() => window.open(webUrl, '_blank'), 1000);
                    } catch {
                        window.open(webUrl, '_blank');
                    }
                } else {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
                }
                
                setTimeout(() => {
                    incrementTaskCount(task.id);
                    onComplete(task, taskButton);
                    updateTaskProgress(taskInfo, task.id);
                    
                    if ((taskCounts[task.id] || 0) + 1 >= maxCount) {
                        taskButton.innerHTML = '<i class="fas fa-check"></i> Completed';
                        taskButton.disabled = true;
                        taskButton.classList.add("completed");
                    }
                }, 5000);
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
                const progressBar = document.getElementById('taskProgress');
                if (progressBar) {
                    const totalTasks = document.querySelectorAll('.task-container').length;
                    const completedTasks = document.querySelectorAll('.task-button.completed').length;
                    const progressPercent = Math.round((completedTasks / totalTasks) * 100);
                    progressBar.style.width = `${progressPercent}%`;
                    progressBar.querySelector('.progress-text').textContent = `${progressPercent}%`;
                }
            };
        }
    }
    
    taskContainer.appendChild(taskInfo);
    taskContainer.appendChild(taskButton);
    return taskContainer;
}

function incrementTaskCount(taskId) {
    const counts = JSON.parse(localStorage.getItem('taskCounts') || '{}');
    counts[taskId] = Math.min((counts[taskId] || 0) + 1, 100);
    localStorage.setItem('taskCounts', JSON.stringify(counts));
}

function updateTaskProgress(taskInfo, taskId) {
    const counts = JSON.parse(localStorage.getItem('taskCounts') || '{}');
    const currentCount = Math.min(counts[taskId] || 0, 100);
    const progressElement = taskInfo.querySelector('.task-progress');
    if (progressElement) {
        progressElement.innerHTML = `<i class="fas fa-chart-line"></i> Progress: ${currentCount}/100`;
    }
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
