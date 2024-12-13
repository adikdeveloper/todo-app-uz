class TodoApp {
    constructor() {
        // Asosiy ma'lumotlar
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.categories = ['Hammasi', 'Shaxsiy', 'Ish', 'O\'qish', 'Sport'];
        this.currentFilter = 'Hammasi';
        this.currentEditId = null;

        // DOM elementlarini yuklash
        this.initializeElements();
        
        // Hodisalarni ulash
        this.setupEventListeners();
        
        // Dastlabki ko'rinishni yaratish
        this.render();
    }

    // DOM elementlarini tanlash va o'zlashtirish
    initializeElements() {
        // Asosiy konteynerlar
        this.todoList = document.querySelector('.todo-list');
        this.progressCount = document.querySelector('.progress-count');
        this.progressFill = document.querySelector('.progress-fill');
        
        // Kiritish maydonlari va tugmalar
        this.searchInput = document.querySelector('.search-input');
        this.addTaskBtn = document.querySelector('.add-task-btn');
        this.categoryButtons = document.querySelectorAll('.category');
        
        // Modal oyna elementlari
        this.modal = document.getElementById('taskModal');
        this.taskInput = document.getElementById('taskInput');
        this.taskCategory = document.getElementById('taskCategory');
        this.taskDate = document.getElementById('taskDate');
        this.saveTaskBtn = document.getElementById('saveTask');
        this.cancelTaskBtn = document.getElementById('cancelTask');
    }

    // Barcha hodisalarni ulash
    setupEventListeners() {
        // Yangi vazifa qo'shish tugmasi
        this.addTaskBtn.addEventListener('click', () => this.openModal());
        
        // Qidiruv maydoni
        this.searchInput.addEventListener('input', (e) => this.searchTasks(e.target.value));
        
        // Kategoriya filtrlari
        this.categoryButtons.forEach(button => {
            button.addEventListener('click', () => this.filterTasks(button.dataset.category));
        });
        
        // Modal oyna hodisalari
        this.saveTaskBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveTask();
        });
        
        this.cancelTaskBtn.addEventListener('click', () => this.closeModal());
        
        // Vazifalar ro'yxati uchun hodisalar (delegatsiya orqali)
        this.todoList.addEventListener('click', (e) => {
            const todoItem = e.target.closest('.todo-item');
            if (!todoItem) return;

            if (e.target.closest('.todo-checkbox')) {
                this.toggleTask(Number(todoItem.dataset.id));
            } else if (e.target.closest('.action-btn')) {
                const isDelete = e.target.closest('.action-btn').querySelector('.fa-trash');
                const isEdit = e.target.closest('.action-btn').querySelector('.fa-edit');
                
                if (isDelete) {
                    this.deleteTask(Number(todoItem.dataset.id));
                } else if (isEdit) {
                    this.editTask(Number(todoItem.dataset.id));
                }
            }
        });
        
        // Modal oynani tashqi qismiga bosganda yopish
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    // Vazifa qo'shish
    addTask(taskData) {
        const task = {
            id: Date.now(),
            title: taskData.title,
            category: taskData.category,
            dueDate: taskData.dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
    }

    // Vazifani o'chirish
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.render();
    }

    // Vazifa holatini o'zgartirish (bajarildi/bajarilmadi)
    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    // Vazifani tahrirlash
    editTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            this.currentEditId = id;
            this.taskInput.value = task.title;
            this.taskCategory.value = task.category;
            this.taskDate.value = task.dueDate;
            this.openModal();
        }
    }

    // Vazifalarni filtrlash
    filterTasks(category) {
        this.currentFilter = category;
        this.categoryButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.category === category);
        });
        this.render();
    }

    // Vazifalarni qidirish
    searchTasks(query) {
        const searchText = query.toLowerCase();
        const filteredTasks = this.tasks.filter(task => {
            const matchesSearch = task.title.toLowerCase().includes(searchText);
            const matchesFilter = this.currentFilter === 'Hammasi' || 
                                task.category === this.currentFilter;
            return matchesSearch && matchesFilter;
        });
        this.renderTasks(filteredTasks);
    }

    // Modal oynani ochish
    openModal() {
        this.modal.style.display = 'block';
        this.taskInput.focus();
    }

    // Modal oynani yopish
    closeModal() {
        this.modal.style.display = 'none';
        this.resetForm();
    }

    // Forma maydonlarini tozalash
    resetForm() {
        this.currentEditId = null;
        this.taskInput.value = '';
        this.taskCategory.value = this.categories[1]; // 'Shaxsiy' kategoriyasi
        this.taskDate.value = '';
    }

    // Vazifani saqlash
    saveTask() {
        const taskData = {
            title: this.taskInput.value.trim(),
            category: this.taskCategory.value,
            dueDate: this.taskDate.value
        };

        if (!taskData.title) {
            alert('Vazifa nomini kiriting!');
            return;
        }

        if (this.currentEditId) {
            // Mavjud vazifani tahrirlash
            const task = this.tasks.find(t => t.id === this.currentEditId);
            Object.assign(task, taskData);
        } else {
            // Yangi vazifa qo'shish
            this.addTask(taskData);
        }

        this.closeModal();
    }

    // Vazifalarni localStorage ga saqlash
    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Vazifalarni saqlashda xatolik:', error);
        }
    }

    // Progress panelini yangilash
    updateProgress() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        
        this.progressCount.textContent = `${completed}/${total}`;
        this.progressFill.style.width = total ? `${(completed/total) * 100}%` : '0%';
    }

    // Vazifalar ro'yxatini ko'rsatish
    renderTasks(tasksToRender = this.tasks) {
        const filteredTasks = tasksToRender.filter(task => 
            this.currentFilter === 'Hammasi' || task.category === this.currentFilter
        );

        this.todoList.innerHTML = filteredTasks.map(task => `
            <div class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="todo-checkbox ${task.completed ? 'checked' : ''}"></div>
                <div class="todo-content">
                    <div class="todo-title">${task.title}</div>
                    <div class="todo-subtitle">${task.category} • ${this.formatDate(task.dueDate)}</div>
                </div>
                <div class="todo-actions">
                    <button class="action-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Barcha elementlarni yangilash
    render() {
        this.renderTasks();
        this.updateProgress();
    }

    // Sanani formatlash
    formatDate(dateString) {
        if (!dateString) return 'Muddatsiz';
        const date = new Date(dateString);
        return date.toLocaleDateString('uz-UZ', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
}

// Ilovani ishga tushirish
const todoApp = new TodoApp();