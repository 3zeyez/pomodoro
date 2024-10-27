const modes = {
    pomodoro: { minutes: 25, backgroundColor: '#ba4949' },
    shortBreak: { minutes: 5, backgroundColor: '#38858a' },
    longBreak: { minutes: 15, backgroundColor: '#397097' }
};

let timeLeft;
let currentMode = 'pomodoro';
let timerInterval = null;
let isRunning = false;
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Initialize tasks from localStorage
function initTasks() {
    renderTasks();
    
    // Add enter key listener for task input
    document.getElementById('task-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
}

function addTask() {
    const input = document.getElementById('task-input');
    const taskText = input.value.trim();
    
    if (taskText) {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false
        };
        
        tasks.push(task);
        saveTasks();
        renderTasks();
        input.value = '';
    }
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" class="task-checkbox" 
                   ${task.completed ? 'checked' : ''} 
                   onclick="toggleTask(${task.id})">
            <span class="task-text">${task.text}</span>
            <button class="delete-task-btn" onclick="deleteTask(${task.id})">Delete</button>
        `;
        
        taskList.appendChild(li);
    });
}

function setMode(mode) {
    // Reset active state for all buttons
    document.querySelectorAll('.mode-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Set active state for clicked button
    event.target.classList.add('active');

    currentMode = mode;
    document.body.style.backgroundColor = modes[mode].backgroundColor;
    
    // Update task name
    const taskName = mode === 'pomodoro' ? 'Time to focus!' : 'Time for a break!';
    document.getElementById('task-name').textContent = taskName;

    resetTimer();
}

function updateDisplay(minutes, seconds) {
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = display;
}

function startTimer() {
    if (isRunning) {
        clearInterval(timerInterval);
        document.getElementById('start-btn').textContent = 'START';
        isRunning = false;
        return;
    }

    isRunning = true;
    document.getElementById('start-btn').textContent = 'PAUSE';

    if (!timeLeft) {
        timeLeft = modes[currentMode].minutes * 60;
    }

    timerInterval = setInterval(() => {
        timeLeft--;

        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        updateDisplay(minutes, seconds);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            playAlarm();
            resetTimer();
            isRunning = false;
            document.getElementById('start-btn').textContent = 'START';
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = modes[currentMode].minutes * 60;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    updateDisplay(minutes, seconds);
    document.getElementById('start-btn').textContent = 'START';
    isRunning = false;
}

function playAlarm() {
    // Create and play a simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Initialize timer and tasks
resetTimer();
initTasks();
