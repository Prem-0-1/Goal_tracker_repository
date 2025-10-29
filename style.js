document.addEventListener('DOMContentLoaded', () => {
    const LOGIN_PASSWORD = '1234'; 
    const loginOverlay = document.getElementById('login-overlay');
    const loginButton = document.getElementById('login-button');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');
    const appContainer = document.querySelector('.app-container');
    const logoutBtn = document.getElementById('logout-btn');

    const goalsContainer = document.getElementById('goal-cards-container');
    const addGoalBtn = document.getElementById('add-goal-btn');
    const goalsListTitle = document.getElementById('goals-list-title');
    
    const modalOverlay = document.getElementById('goal-modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const goalForm = document.getElementById('goal-form');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    
    const goalIdInput = document.getElementById('goal-id-input');
    const titleInput = document.getElementById('goal-title-input');
    const deadlineInput = document.getElementById('goal-deadline-input');
    const progressInput = document.getElementById('goal-progress-input');
    const categoryInput = document.getElementById('goal-category-input');

    function getRandomProgress() {
        return Math.floor(Math.random() * 100); 
    }
    
    let goals = [];
    const savedGoals = localStorage.getItem('goals');
    
    if (savedGoals) {
        goals = JSON.parse(savedGoals);
    } else {
        goals = [
            { id: 1, title: "Finish Full-Stack Project", category: "High", deadline: "2025-11-09", progress: getRandomProgress(), completed: false },
            { id: 2, title: "Read \"The Pragmatic Programmer\"", category: "Medium", deadline: "2025-11-18", progress: getRandomProgress(), completed: false },
            { id: 3, title: "20 Minutes of Daily Stretching", category: "Low", deadline: "2025-11-15", progress: getRandomProgress(), completed: false },
            { id: 4, title: "Complete UI/UX Design Flow", category: "High", deadline: "2025-12-11", progress: getRandomProgress(), completed: false }
        ];
        saveGoalsToStorage();
    }

    let currentView = 'all-goals'; 
    let currentSort = 'importance'; 

    function saveGoalsToStorage() {
        localStorage.setItem('goals', JSON.stringify(goals));
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString + 'T00:00:00'); 
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function saveGoal(e) {
        e.preventDefault();
        
        const goalId = goalIdInput.value ? parseInt(goalIdInput.value) : null;
        const progressValue = Math.min(100, Math.max(0, parseInt(progressInput.value)));

        const newGoalData = {
            title: titleInput.value,
            deadline: deadlineInput.value,
            progress: progressValue,
            category: categoryInput.value,
            completed: progressValue === 100
        };

        if (goalId) {
            const index = goals.findIndex(g => g.id === goalId);
            if (index > -1) {
                goals[index] = { ...goals[index], ...newGoalData };
            }
        } else {
            newGoalData.id = Date.now(); 
            goals.push(newGoalData);
        }

        hideModal();
        saveGoalsToStorage();
        renderGoals(); 
    }

    function deleteGoal(id) {
        const goal = goals.find(g => g.id === id);
        if (!goal) return;
        if (confirm(`Are you sure you want to delete "${goal.title}"?`)) {
            goals = goals.filter(g => g.id !== id);
            saveGoalsToStorage();
            renderGoals(); 
        }
    }
    
    function editGoal(id) {
        const goal = goals.find(g => g.id === id);
        if (!goal) return;

        titleInput.value = goal.title; 
        modalTitle.textContent = 'Edit Goal';
        goalIdInput.value = goal.id;
        deadlineInput.value = goal.deadline; 
        progressInput.value = goal.progress;
        categoryInput.value = goal.category;
        
        showModal();
    }

    function completeGoal(id) {
        const goalIndex = goals.findIndex(g => g.id === id);
        if (goalIndex > -1) {
            const goal = goals[goalIndex];
            if (!goal.completed) {
                if (confirm(`Mark "${goal.title}" as completed?`)) {
                    goals[goalIndex].progress = 100;
                    goals[goalIndex].completed = true;
                    saveGoalsToStorage();
                    renderGoals(); 
                }
            }
        }
    }

    function sortGoals(goalsArray, sortType) {
        const importanceOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        let sortedArray = [...goalsArray]; 

        switch (sortType) {
            case 'importance':
                return sortedArray.sort((a, b) => importanceOrder[b.category] - importanceOrder[a.category]);
            case 'deadline':
                return sortedArray.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
            case 'progress':
                return sortedArray.sort((a, b) => b.progress - a.progress);
            default:
                return sortedArray;
        }
    }

    function filterGoals(goalsArray, view) {
        let filteredArray = [...goalsArray]; 
        
        switch (view) {
            case 'completed':
                goalsListTitle.textContent = 'Completed Goals';
                return filteredArray.filter(g => g.completed || g.progress === 100);
            case 'deadlines':
                goalsListTitle.textContent = 'Goals by Deadline (In Progress)';
                return filteredArray.filter(g => g.progress < 100); 
            case 'all-goals':
            default:
                goalsListTitle.textContent = 'All Goals';
                return filteredArray;
        }
    }

    function updateStatCards() {
        const goalsInProgress = goals.filter(g => g.progress < 100).length;
        const goalsCompleted = goals.filter(g => g.completed || g.progress === 100).length;
        const totalProgress = goals.reduce((sum, g) => sum + g.progress, 0);
        const averageRate = goals.length > 0 ? Math.round(totalProgress / goals.length) : 0;
        
        document.getElementById('goals-in-progress').textContent = goalsInProgress;
        document.getElementById('goals-completed').textContent = goalsCompleted;
        document.getElementById('completion-rate').textContent = `${averageRate}%`;
    }

    function createGoalCard(goal) {
        const card = document.createElement('div');
        card.classList.add('goal-card');
        card.dataset.id = goal.id;
        
        const isCompleted = goal.completed || goal.progress === 100;
        const importanceTag = goal.category;
        
        if (isCompleted) card.classList.add('completed');

        const completionMessage = isCompleted ? 'Completed! Great work.' : 'Click if completed';

        card.innerHTML = `
            <div class="card-header">
                <div class="card-completion-status">
                    <button data-id="${goal.id}" class="complete-btn" title="Mark as Completed" ${isCompleted ? 'disabled' : ''}>
                        <i class="fa-solid fa-check"></i>
                    </button>
                    ${completionMessage}
                </div>
                <div class="title-and-actions">
                    <div class="goal-info">
                        <div class="goal-title">${goal.title}</div>
                        <span class="category-tag tag-${importanceTag}">${importanceTag} Importance</span>
                    </div>
                    <div class="card-actions">
                        <button data-id="${goal.id}" class="edit-btn" title="Edit Goal"><i class="fa-solid fa-pen"></i></button>
                        <button data-id="${goal.id}" class="delete-btn" title="Delete Goal"><i class="fa-solid fa-times"></i></button>
                    </div>
                </div>
            </div>
            <div class="progress-row">
                <div class="progress-container">
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill ${importanceTag}" style="width: ${isCompleted ? 100 : goal.progress}%;"></div>
                    </div>
                </div>
                <span class="progress-text">${isCompleted ? 'Completed!' : goal.progress + '% Complete'}</span>
            </div>
            <div class="card-details">
                <span><i class="fa-solid fa-calendar-alt"></i> Due: ${formatDate(goal.deadline)}</span>
            </div>
        `;
        
        goalsContainer.appendChild(card);
    }

    function renderGoals() {
        let goalsToRender = filterGoals(goals, currentView);
        goalsToRender = sortGoals(goalsToRender, currentSort);

        goalsContainer.innerHTML = '';
        if (goalsToRender.length === 0) {
            goalsContainer.innerHTML = `<p style="color:#b0b0b0; text-align:center; padding: 20px;">No goals found for this view.</p>`;
        } else {
            goalsToRender.forEach(createGoalCard);
        }
        
        updateStatCards();
    }

    function showModal() {
        modalOverlay.classList.add('visible');
        titleInput.focus();
    }

    function hideModal() {
        modalOverlay.classList.remove('visible');
        goalForm.reset();
        goalIdInput.value = '';
    }

    function checkPassword() {
        if (passwordInput.value === LOGIN_PASSWORD) {
            sessionStorage.setItem('isLoggedIn', 'true'); 
            passwordInput.value = '';
            loginError.textContent = '';
            initializeApp();
        } else {
            loginError.textContent = 'Incorrect password. Try "1234"';
            passwordInput.focus();
        }
    }

    function initializeApp() {
        if (sessionStorage.getItem('isLoggedIn') === 'true') {
            loginOverlay.style.display = 'none'; 
            appContainer.style.display = 'block'; 
            appContainer.classList.add('visible');
            renderGoals();
        } else {
            appContainer.style.display = 'none';
            loginOverlay.style.display = 'flex';
            passwordInput.focus();
        }
    }

    loginButton.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('isLoggedIn');
        initializeApp();
    });

    addGoalBtn.addEventListener('click', () => {
        modalTitle.textContent = 'New Goal';
        goalForm.reset(); 
        goalIdInput.value = ''; 
        showModal();
    });

    cancelModalBtn.addEventListener('click', hideModal);
    goalForm.addEventListener('submit', saveGoal);

    goalsContainer.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const id = parseInt(target.dataset.id);
        if (target.classList.contains('delete-btn')) deleteGoal(id);
        else if (target.classList.contains('edit-btn')) editGoal(id);
        else if (target.classList.contains('complete-btn')) completeGoal(id);
    });

    document.querySelector('.sidebar').addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (!navItem) return;
        
        e.preventDefault();

        const view = navItem.dataset.view;
        const sort = navItem.dataset.sort;

        if (view) {
            document.querySelectorAll('.navigation [data-view]').forEach(item => item.classList.remove('active'));
            navItem.classList.add('active'); 
            currentView = view;
            renderGoals();
        }

        if (sort) {
            currentSort = sort;
            renderGoals();
        }
    });

    initializeApp();
});
  