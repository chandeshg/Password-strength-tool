document.addEventListener('DOMContentLoaded', async () => {
    console.log("Admin page script loaded."); // Debug log
    const usersTableBody = document.querySelector("#users-table tbody");
    const noDataMessage = document.getElementById("no-data-message");
    const searchInput = document.getElementById("search");
    const paginationContainer = document.createElement("div");
    paginationContainer.classList.add("pagination");
    document.querySelector(".container").appendChild(paginationContainer);

    const rowsPerPage = 3;
    let currentPage = 1;

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/users');
            const users = await response.json();
            updateTable(users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const populateTable = (filteredUsers) => {
        usersTableBody.innerHTML = "";
        if (filteredUsers.length === 0) {
            noDataMessage.style.display = "block";
            console.log("No users found."); // Debug log
        } else {
            noDataMessage.style.display = "none";
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            const paginatedUsers = filteredUsers.slice(start, end);

            paginatedUsers.forEach(user => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>
                        <button class="edit-btn"><span class="icon">✏️</span>Edit</button>
                        <button class="delete-btn" onclick="deleteUser(${user.id})"><span class="icon">🗑️</span>Delete</button>
                    </td>
                `;
                usersTableBody.appendChild(row);
            });
            console.log("User table populated."); // Debug log
        }
    };

    const updatePagination = (filteredUsers) => {
        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.classList.toggle("active", i === currentPage);
            button.addEventListener("click", () => {
                currentPage = i;
                updateTable(filteredUsers);
            });
            paginationContainer.appendChild(button);
        }
    };

    const updateTable = (users) => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredUsers = users.filter(user =>
            user.username.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
        populateTable(filteredUsers);
        updatePagination(filteredUsers);
    };

    searchInput.addEventListener("input", () => fetchUsers());
    fetchUsers();
});

async function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                location.reload();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }
}
