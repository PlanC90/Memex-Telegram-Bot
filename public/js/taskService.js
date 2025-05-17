import { createTaskElement } from './taskUI.js';

function updateProgressBar(completedTasks, totalTasks) {
    const progressPercent = Math.round((completedTasks.size / totalTasks) * 100);
    const progressBar = document.getElementById('taskProgress');
    const progressText = progressBar.querySelector('.progress-text');
    
    progressBar.style.width = `${progressPercent}%`;
    progressText.textContent = `${progressPercent}%`;
}

async function completeTask(taskId) {
  try {
    const username = new URLSearchParams(window.location.search).get('username');
    const response = await fetch("/data/users.json");
    const users = await response.json();
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    if (!users[userIndex].tasks_completed) {
      users[userIndex].tasks_completed = [];
    }

    if (!users[userIndex].tasks_completed.includes(taskId)) {
      users[userIndex].tasks_completed.push(taskId);
      users[userIndex].balance += 50000; // Add reward amount
      
      await fetch('/save/users.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(users)
      });
    }
  } catch (error) {
    console.error("Error completing task:", error);
  }
}


export async function loadTasks(gameTasksDiv, completedTasks, referralLink, onComplete) {
    try {
        const response = await fetch('/data/tasks.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const tasks = await response.json();
        if (!Array.isArray(tasks)) {
            throw new Error('Tasks data is not an array');
        }

        gameTasksDiv.innerHTML = '';
        tasks.forEach(task => {
            const taskElement = createTaskElement(task, completedTasks, referralLink, onComplete);
            if (taskElement) {
                gameTasksDiv.appendChild(taskElement);
            }
        });
        
        updateProgressBar(completedTasks, tasks.length);
    } catch (error) {
        console.error('Error loading tasks:', error);
        gameTasksDiv.innerHTML = '<p class="error">Error loading tasks. Please try again later.</p>';
    }
}
