const API_URL = 'http://localhost:3000/api';

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const taskForm = document.getElementById('task-form');
const tasksList = document.getElementById('tasks-list');
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');

// State
let currentUser = JSON.parse(localStorage.getItem('vuln_user')) || null;

// Initialize
function init() {
    if (currentUser) {
        showDashboard();
    } else {
        showLogin();
    }
}

// UI Toggles
function showLogin() {
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
}

function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    userDisplay.innerText = currentUser.username;
    fetchTasks();
}

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('vuln_user', JSON.stringify(currentUser));
            loginForm.reset();
            loginError.innerText = '';
            showDashboard();
        } else {
            loginError.innerText = data.message || 'Login failed';
        }
    } catch (err) {
        loginError.innerText = 'Network error: ' + err.message;
    }
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('vuln_user');
    showLogin();
});

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: currentUser.id, 
                title, 
                description 
            })
        });

        if (response.ok) {
            taskForm.reset();
            fetchTasks();
        } else {
            alert('Failed to add task');
        }
    } catch (err) {
        alert('Network error: ' + err.message);
    }
});

// Fetch & Render Tasks
async function fetchTasks() {
    try {
        // Vulnerable: Client decides which tasks to fetch based on ID. 
        // Can be intercepted or manipulated to fetch other users' tasks.
        const response = await fetch(`${API_URL}/tasks?userId=${currentUser.id}`);
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
    }
}

function renderTasks(tasks) {
    tasksList.innerHTML = '';
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '<p>No tasks found.</p>';
        return;
    }

    tasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = 'task-item';
        
        // Vulnerable: Using innerHTML directly renders malicious scripts (Stored XSS)
        taskEl.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <button class="btn-danger" onclick="deleteTask(${task.id})">Delete</button>
            </div>
            <div class="task-desc">${task.description}</div>
        `;
        
        tasksList.appendChild(taskEl);
    });
}

// Delete Task
window.deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        // Vulnerable: Backend doesn't verify if this task belongs to currentUser
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchTasks();
        } else {
            alert('Failed to delete task');
        }
    } catch (err) {
        console.error('Error deleting task:', err);
    }
};

// Start App
init();
