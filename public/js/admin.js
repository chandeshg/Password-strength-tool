document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadActiveSessions();
    // Refresh active sessions every 30 seconds
    setInterval(loadActiveSessions, 30000);
});

async function loadUsers() {
    try {
        const response = await fetch('/admin/users', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            displayUsers(data.users);
            updateStats(data.users);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('userTableBody');
    if (!tbody) return;

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <div class="user-info">
                    <i class="fas fa-user-circle"></i>
                    <span>${user.username}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td>
                <span class="status-badge ${user.is_verified ? 'verified' : 'pending'}">
                    <i class="fas fa-${user.is_verified ? 'check-circle' : 'clock'}"></i>
                    ${user.is_verified ? 'Verified' : 'Pending'}
                </span>
            </td>
            <td>${user.created_at}</td>
            <td>
                <button class="action-btn delete" onclick="deleteUser(${user.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function updateStats(users) {
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('verifiedUsers').textContent = users.filter(u => u.is_verified).length;
    document.getElementById('pendingUsers').textContent = users.filter(u => !u.is_verified).length;
}

async function deleteUser(id) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
        const response = await fetch(`/admin/users/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            loadUsers();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function handleLogout() {
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(() => window.location.href = '/admin-login')
    .catch(console.error);
}

async function loadActiveSessions() {
    try {
        const response = await fetch('/api/admin/active-sessions', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            displayActiveSessions(data.sessions);
            document.getElementById('activeUsers').textContent = data.sessions.length;
        }
    } catch (error) {
        console.error('Error loading sessions:', error);
    }
}

function displayActiveSessions(sessions) {
    const tbody = document.getElementById('sessionsTableBody');
    if (!tbody) return;

    tbody.innerHTML = sessions.map(session => `
        <tr>
            <td>
                <div class="user-info">
                    <i class="fas fa-user-circle"></i>
                    <span>${session.username}</span>
                </div>
            </td>
            <td>${session.email}</td>
            <td>${new Date(session.loginTime).toLocaleString()}</td>
            <td>${new Date(session.lastActivity).toLocaleString()}</td>
        </tr>
    `).join('');
}
