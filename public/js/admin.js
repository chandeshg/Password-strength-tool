// Fetch users from the server and populate the table
async function fetchUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();

        const tableBody = document.querySelector('#users-table tbody');
        tableBody.innerHTML = ''; // Clear existing rows

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <button onclick="deleteUser(${user.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

// Delete a user
async function deleteUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        if (response.ok) {
            alert('User deleted successfully');
            fetchUsers(); // Refresh the table
        } else {
            alert('Error deleting user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

// Fetch users when the page loads
document.addEventListener('DOMContentLoaded', fetchUsers);
