// State management
let currentUser = null;
let authToken = localStorage.getItem('authToken') || null;

// WebSocket connection
let socket = null;

// DOM Elements
const loginSection = document.getElementById('loginSection');
const registerSection = document.getElementById('registerSection');
const postJobSection = document.getElementById('postJobSection');
const jobsSection = document.getElementById('jobsSection');
const applicationsSection = document.getElementById('applicationsSection');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const postJobBtn = document.getElementById('postJobBtn');
const logoutBtn = document.getElementById('logoutBtn');
const jobsContainer = document.getElementById('jobsContainer');
const applicationsContainer = document.getElementById('applicationsContainer');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check if user is already logged in
    if (authToken) {
        fetchCurrentUser().then(() => {
            connectWebSocket();
        });
    } else {
        showLoginSection();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Load jobs
    loadJobs();
}

function setupEventListeners() {
    // Navigation buttons
    loginBtn.addEventListener('click', showLoginSection);
    registerBtn.addEventListener('click', showRegisterSection);
    postJobBtn.addEventListener('click', showPostJobSection);
    logoutBtn.addEventListener('click', logout);
    
    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('postJobForm').addEventListener('submit', handlePostJob);
}

// UI Functions
function showLoginSection() {
    hideAllSections();
    loginSection.classList.remove('hidden');
}

function showRegisterSection() {
    hideAllSections();
    registerSection.classList.remove('hidden');
}

function showPostJobSection() {
    hideAllSections();
    postJobSection.classList.remove('hidden');
}

function showJobsSection() {
    hideAllSections();
    jobsSection.classList.remove('hidden');
}

function hideAllSections() {
    loginSection.classList.add('hidden');
    registerSection.classList.add('hidden');
    postJobSection.classList.add('hidden');
    applicationsSection.classList.add('hidden');
}

function updateNavigation() {
    if (currentUser) {
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        
        if (currentUser.userType === 'employer') {
            postJobBtn.classList.remove('hidden');
        } else {
            postJobBtn.classList.add('hidden');
        }
    } else {
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        postJobBtn.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }
}

// Show applications section for employers
function showApplicationsSection() {
    hideAllSections();
    applicationsSection.classList.remove('hidden');
    loadApplications();
}

// Auth Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            showNotification('Login successful!', 'success');
            updateNavigation();
            showJobsSection();
            loadJobs();
            connectWebSocket();
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Network error occurred', 'error');
        console.error('Login error:', error);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const userType = document.getElementById('userType').value;
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, userType })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Registration successful! Please login.', 'success');
            showLoginSection();
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Network error occurred', 'error');
        console.error('Registration error:', error);
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    showNotification('Logged out successfully', 'info');
    updateNavigation();
    showLoginSection();
}

async function fetchCurrentUser() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data;
            updateNavigation();
            showJobsSection();
        } else {
            // Token invalid, logout
            logout();
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        logout();
    }
}

// Job Functions
async function handlePostJob(e) {
    e.preventDefault();
    
    const title = document.getElementById('jobTitle').value;
    const description = document.getElementById('jobDescription').value;
    const requirements = document.getElementById('jobRequirements').value;
    const location = document.getElementById('jobLocation').value;
    
    // Simple form validation
    if (!title || !description || !requirements || !location) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, description, requirements, location })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Job posted successfully!', 'success');
            document.getElementById('postJobForm').reset();
            loadJobs();
            showJobsSection();
        } else {
            showNotification(data.message || 'Failed to post job', 'error');
        }
    } catch (error) {
        showNotification('Network error occurred', 'error');
        console.error('Post job error:', error);
    }
}

async function loadJobs() {
    try {
        const response = await fetch('http://localhost:3000/api/jobs');
        const jobs = await response.json();
        
        if (response.ok) {
            renderJobs(jobs);
        } else {
            showNotification('Failed to load jobs', 'error');
        }
    } catch (error) {
        showNotification('Network error occurred', 'error');
        console.error('Load jobs error:', error);
    }
}

function renderJobs(jobs) {
    jobsContainer.innerHTML = '';
    
    if (jobs.length === 0) {
        jobsContainer.innerHTML = '<p class="text-center col-span-3">No jobs available</p>';
        return;
    }
    
    jobs.forEach(job => {
        const jobElement = document.createElement('div');
        jobElement.className = 'bg-white p-6 rounded-lg shadow-md';
        jobElement.innerHTML = `
            <h3 class="text-xl font-bold mb-2">${job.title}</h3>
            <p class="text-gray-600 mb-4">${job.description}</p>
            <div class="mb-4">
                <h4 class="font-semibold">Requirements:</h4>
                <p class="text-gray-600">${job.requirements}</p>
            </div>
            <div class="flex justify-between items-center">
                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">${job.location}</span>
                <button onclick="applyForJob(${job.id})" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Apply</button>
            </div>
        `;
        jobsContainer.appendChild(jobElement);
    });
}

async function applyForJob(jobId) {
    if (!authToken) {
        showNotification('Please login to apply for jobs', 'error');
        showLoginSection();
        return;
    }
    
    // Check if user is a job seeker
    if (currentUser.userType !== 'job_seeker') {
        showNotification('Only job seekers can apply for jobs', 'error');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/jobs/${jobId}/apply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Application submitted successfully!', 'success');
        } else {
            showNotification(data.message || 'Failed to apply for job', 'error');
        }
    } catch (error) {
        showNotification('Network error occurred', 'error');
        console.error('Apply job error:', error);
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notificationsContainer = document.getElementById('notifications');
    
    const notification = document.createElement('div');
    notification.className = `px-4 py-3 rounded shadow-lg transition transform duration-300 ease-in-out`;
    
    // Set styles based on type
    switch(type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.textContent = message;
    
    // Add to container
    notificationsContainer.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// WebSocket for real-time notifications
function connectWebSocket() {
    if (socket) {
        socket.disconnect();
    }
    
    // Connect to WebSocket server
    socket = io('http://localhost:3000', {
        auth: {
            token: authToken
        }
    });
    
    socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        if (currentUser) {
            socket.emit('join', currentUser.id);
        }
    });
    
    socket.on('new_job', (data) => {
        showNotification(data.message, 'info');
    });
    
    socket.on('new_application', (data) => {
        showNotification(data.message, 'info');
    });
    
    socket.on('application_rejected', (data) => {
        showNotification(data.message, 'warning');
    });
    
    socket.on('interview_scheduled', (data) => {
        showNotification(data.message, 'success');
    });
    
    socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
    });
}

// Load applications for employers
async function loadApplications() {
    if (!authToken || currentUser.userType !== 'employer') {
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/employers/applications', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const applications = await response.json();
        
        if (response.ok) {
            renderApplications(applications);
        } else {
            showNotification('Failed to load applications', 'error');
        }
    } catch (error) {
        showNotification('Network error occurred', 'error');
        console.error('Load applications error:', error);
    }
}

// Render applications for employers
function renderApplications(applications) {
    applicationsContainer.innerHTML = '';
    
    if (applications.length === 0) {
        applicationsContainer.innerHTML = '<p class="text-center">No applications received</p>';
        return;
    }
    
    applications.forEach(application => {
        const applicationElement = document.createElement('div');
        applicationElement.className = 'bg-white p-6 rounded-lg shadow-md';
        applicationElement.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-xl font-bold">${application.job_title}</h3>
                    <p class="text-gray-600">Applicant: ${application.applicant_name}</p>
                    <p class="text-gray-600">Applied on: ${new Date(application.applied_at).toLocaleDateString()}</p>
                    <p class="mt-2">Status: <span class="font-semibold">${application.status}</span></p>
                </div>
                <div class="space-x-2">
                    ${application.status === 'pending' ? 
                        `<button onclick="rejectApplication(${application.id})" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Reject</button>
                         <button onclick="scheduleInterview(${application.id})" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Schedule Interview</button>` : 
                        ''
                    }
                </div>
            </div>
        `;
        applicationsContainer.appendChild(applicationElement);
    });
}

// Reject an application
async function rejectApplication(applicationId) {
    if (!authToken || currentUser.userType !== 'employer') {
        showNotification('Unauthorized action', 'error');
        return;
    }
    
    const reason = prompt('Enter reason for rejection (optional):');
    
    try {
        const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ reason: reason || 'No reason provided' })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Application rejected successfully', 'success');
            loadApplications();
        } else {
            showNotification(data.message || 'Failed to reject application', 'error');
        }
    } catch (error) {
        showNotification('Network error occurred', 'error');
        console.error('Reject application error:', error);
    }
}

// Schedule an interview
async function scheduleInterview(applicationId) {
    if (!authToken || currentUser.userType !== 'employer') {
        showNotification('Unauthorized action', 'error');
        return;
    }
    
    const interviewDate = prompt('Enter interview date and time (e.g., 2025-03-10 10:00):');
    
    if (!interviewDate) {
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/schedule-interview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ interviewDate })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Interview scheduled successfully', 'success');
            loadApplications();
        } else {
            showNotification(data.message || 'Failed to schedule interview', 'error');
        }
    } catch (error) {
        showNotification('Network error occurred', 'error');
        console.error('Schedule interview error:', error);
    }
}