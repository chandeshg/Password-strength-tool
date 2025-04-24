document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    setupEventListeners();
});

async function loadUsers() {
    try {
        // Add proper error handling for the fetch
        const response = await fetch('/api/admin/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Received user data:', data); // Debug log

        if (data.success && Array.isArray(data.users)) {
            populateUserTable(data.users);
            updateTotalEntries(data.users.length);
        } else {
            throw new Error('Invalid data format received');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-alert';
        errorMessage.textContent = 'Failed to load users. Please try again.';
        document.querySelector('.main-content').prepend(errorMessage);
    }
}

function populateUserTable(users) {
    const tableBody = document.getElementById('userTableBody');
    if (!tableBody) return;

    if (users.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-data">No users found</td>
            </tr>`;
        return;
    }

    tableBody.innerHTML = users.map(user => `
        <tr>
            <td>${user.username || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>
                <span class="status-badge ${user.status || 'pending'}">${user.status || 'Pending'}</span>
            </td>
            <td>${formatDate(user.lastCheck) || 'Never'}</td>
            <td class="actions">
                <button onclick="editUser(${user.id})" class="btn-action edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteUser(${user.id})" class="btn-action delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function formatDate(date) {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
}

function updateTotalEntries(total) {
    const totalEntriesSpan = document.getElementById('totalEntries');
    if (totalEntriesSpan) {
        totalEntriesSpan.textContent = total;
    }
}

function setupEventListeners() {
    // Settings button
    const settingsBtn = document.querySelector('[data-panel="settings"]');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            window.location.href = '/admin/settings';
        });
    }

    // Logout button
    const logoutBtn = document.querySelector('[data-panel="logout"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filterTable(searchTerm);
        });
    }
}

function filterTable(searchTerm) {
    const rows = document.querySelectorAll('#userTableBody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

async function handleLogout() {
    try {
        const response = await fetch('/api/admin/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            window.location.href = '/'; // Redirect to home page instead of admin login
        } else {
            throw new Error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showError('Failed to logout');
    }
}

async function editUser(userId) {
    try {
        const response = await fetch(`/api/admin/users/${userId}`);
        const data = await response.json();
        
        if (data.success) {
            // Populate and show edit modal
            document.getElementById('userModal').style.display = 'block';
            document.getElementById('username').value = data.user.username;
            document.getElementById('email').value = data.user.email;
            document.getElementById('status').value = data.user.status;
        }
    } catch (error) {
        showError('Failed to load user data');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        
        if (data.success) {
            loadUsers(); // Refresh the table
            showMessage('User deleted successfully', 'success');
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        showError('Failed to delete user');
    }
}

function showMessage(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    document.querySelector('.main-content').prepend(alert);
    setTimeout(() => alert.remove(), 3000);
}

function showError(message) {
    showMessage(message, 'error');
}
