// Date and Time functionality
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const updateDateTime = () => {
  const now = new Date();
  const day = days[now.getDay()];
  const monthname = months[now.getMonth()];
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  document.querySelector("#weekday").textContent = `${day}, `;
  document.querySelector("#monthday").textContent = `${now.getDate()} of `;
  document.querySelector("#month").textContent = monthname;
  document.querySelector("#hour").textContent = displayHours;
  document.querySelector("#minutes").textContent = minutes;
  document.querySelector("#ampm").textContent = period;
};

// Todo List functionality
class TodoList {
  constructor() {
    this.input = document.querySelector("input[type='text']");
    this.addButton = document.querySelector(".add-task");
    this.ul = document.querySelector("ul");
    this.deleteAllBtn = document.querySelector(".delete-all");
    this.filterButtons = document.querySelectorAll('.filters button');
    this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    this.currentFilter = 'all';
    
    this.setupEventListeners();
    this.renderTasks();
    this.updateStats();
  }

  setupEventListeners() {
    // Add task on Enter key
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.input.value.trim()) {
        this.addTask(this.input.value.trim());
      }
    });

    // Add task on button click
    this.addButton.addEventListener('click', () => {
      if (this.input.value.trim()) {
        this.addTask(this.input.value.trim());
      }
    });

    // Delete task
    this.ul.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.preventDefault();
        const confirmDelete = confirm('Are you sure you want to delete this task?');
        if (confirmDelete) {
          this.removeTask(e.target.closest('li'));
        }
      }
    });

    // Toggle task completion
    this.ul.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        this.toggleTask(e.target.closest('li'));
      }
    });

    // Delete all tasks
    this.deleteAllBtn.addEventListener('click', () => {
      if (this.tasks.length === 0) {
        alert('No tasks to delete!');
        return;
      }
      const confirmDelete = confirm('Are you sure you want to delete all tasks?');
      if (confirmDelete) {
        this.deleteAllTasks();
      }
    });

    // Filter tasks
    this.filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.currentFilter = button.dataset.filter;
        this.renderTasks();
      });
    });
  }

  addTask(text) {
    const task = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.tasks.push(task);
    this.saveTasksToStorage();
    this.renderTasks();
    this.updateStats();
    this.input.value = '';
  }

  removeTask(li) {
    const taskId = parseInt(li.dataset.id);
    this.tasks = this.tasks.filter(task => task.id !== taskId);
    this.saveTasksToStorage();
    
    // Add removal animation
    li.style.animation = 'slideOut 0.3s ease forwards';
    setTimeout(() => {
      this.renderTasks();
      this.updateStats();
    }, 300);
  }

  toggleTask(li) {
    const taskId = parseInt(li.dataset.id);
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasksToStorage();
      this.renderTasks();
      this.updateStats();
    }
  }

  deleteAllTasks() {
    this.tasks = [];
    this.saveTasksToStorage();
    this.renderTasks();
    this.updateStats();
  }

  filterTasks() {
    switch (this.currentFilter) {
      case 'completed':
        return this.tasks.filter(task => task.completed);
      case 'pending':
        return this.tasks.filter(task => !task.completed);
      default:
        return this.tasks;
    }
  }

  renderTask(task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    li.innerHTML = `
      <label>
        <input type="checkbox" ${task.completed ? 'checked' : ''}>
        <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
        <a href="#" title="Delete task">×</a>
      </label>
    `;
    this.ul.appendChild(li);
    
    // Add animation for new tasks
    li.style.animation = 'slideIn 0.3s ease forwards';
  }

  renderTasks() {
    this.ul.innerHTML = '';
    const filteredTasks = this.filterTasks();
    
    filteredTasks.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    }).forEach(task => this.renderTask(task));

    // Show message if no tasks
    if (filteredTasks.length === 0) {
      const message = document.createElement('li');
      message.className = 'no-tasks text-center text-muted p-3';
      message.textContent = this.currentFilter === 'all' ? 
        'No tasks yet! Add some tasks to get started.' :
        `No ${this.currentFilter} tasks found.`;
      this.ul.appendChild(message);
    }
  }

  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(task => task.completed).length;
    const pending = total - completed;

    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('pending-tasks').textContent = pending;
  }

  saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const todoList = new TodoList();
  setInterval(updateDateTime, 1000);
  updateDateTime();
});