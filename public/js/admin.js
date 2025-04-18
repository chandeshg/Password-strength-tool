document.addEventListener('DOMContentLoaded', () => {
    // Check admin authentication
    if (!localStorage.getItem('adminToken')) {
        window.location.href = 'admin-login.html';
        return;
    }

    const usersTableBody = document.querySelector("#users-table tbody");
    const searchInput = document.getElementById("search");

    let allUsers = []; // Store all users for filtering

    async function fetchUsers() {
        try {
            const response = await fetch('http://localhost:3000/api/admin/users');
            allUsers = await response.json(); // Store users globally
            displayUsers(allUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Error loading users');
        }
    }

    function displayUsers(users) {
        usersTableBody.innerHTML = '';
        if (users.length === 0) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center;">No users found</td>
                </tr>`;
            return;
        }

        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>${user.is_verified ? 
                        '<span class="status-verified">Verified</span>' : 
                        '<span class="status-unverified">Unverified</span>'}
                    </td>
                    <td>
                        <button onclick="deleteUser(${user.id})" class="delete-btn">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>`;
            usersTableBody.innerHTML += row;
        });
    }

    function searchUsers(searchTerm) {
        if (!searchTerm) {
            displayUsers(allUsers);
            return;
        }

        const filteredUsers = allUsers.filter(user => 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        displayUsers(filteredUsers);
    }

    // Update search input listener
    searchInput.addEventListener('input', (e) => {
        searchUsers(e.target.value);
    });

    // Initial load
    fetchUsers();
});

async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`http://localhost:3000/api/admin/users/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                location.reload();
            } else {
                alert('Error deleting user');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting user');
        }
    }
}

// Add logout function
function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
}
