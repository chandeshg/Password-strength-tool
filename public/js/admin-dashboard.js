document.addEventListener('DOMContentLoaded', async () => {
    async function fetchUsers() {
        try {
            const response = await fetch('/api/admin/users');
            const data = await response.json();
            
            if (data.success) {
                populateUserTable(data.users);
                updateStats(data.users);
            } else {
                throw new Error(data.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to load users');
        }
    }

    function populateUserTable(users) {
        const tableBody = document.getElementById('userTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = users.length ? users.map(user => `
            <tr>
                <td>
                    <div class="user-info">
                        <span class="username">${user.username}</span>
                        <span class="email">${user.email}</span>
                    </div>
                </td>
                <td><span class="status-badge ${user.status}">${user.status}</span></td>
                <td>${new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
                <td>
                    <button class="actions-btn" onclick="deleteUser(${user.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('') : '<tr><td colspan="4">No users found</td></tr>';
    }

    function updateStats(users) {
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('activeUsers').textContent = users.filter(u => u.status === 'active').length;
        document.getElementById('pendingUsers').textContent = users.filter(u => u.status === 'pending').length;
    }

    // Initial load
    await fetchUsers();
    
    // Refresh every 30 seconds
    setInterval(fetchUsers, 30000);
});
