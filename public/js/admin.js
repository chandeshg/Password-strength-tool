document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin page script loaded."); // Debug log
    const usersTableBody = document.querySelector("#users-table tbody");
    const noDataMessage = document.getElementById("no-data-message");
    const searchInput = document.getElementById("search");
    const paginationContainer = document.createElement("div");
    paginationContainer.classList.add("pagination");
    document.querySelector(".container").appendChild(paginationContainer);

    const users = [
        { id: 1, username: "admin", email: "admin@example.com" },
        { id: 2, username: "user1", email: "user1@example.com" },
        { id: 3, username: "user2", email: "user2@example.com" },
        { id: 4, username: "user3", email: "user3@example.com" },
        { id: 5, username: "user4", email: "user4@example.com" }
    ];

    const rowsPerPage = 3;
    let currentPage = 1;

    function populateTable(filteredUsers) {
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
                        <button class="delete-btn"><span class="icon">🗑️</span>Delete</button>
                    </td>
                `;
                row.querySelector(".delete-btn").addEventListener("click", () => {
                    if (confirm(`Are you sure you want to delete ${user.username}?`)) {
                        const index = users.findIndex(u => u.id === user.id);
                        if (index !== -1) users.splice(index, 1);
                        updateTable();
                    }
                });
                usersTableBody.appendChild(row);
            });
            console.log("User table populated."); // Debug log
        }
    }

    function updatePagination(filteredUsers) {
        paginationContainer.innerHTML = "";
        const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.classList.toggle("active", i === currentPage);
            button.addEventListener("click", () => {
                currentPage = i;
                updateTable();
            });
            paginationContainer.appendChild(button);
        }
    }

    function updateTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredUsers = users.filter(user =>
            user.username.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
        populateTable(filteredUsers);
        updatePagination(filteredUsers);
    }

    searchInput.addEventListener("input", updateTable);
    updateTable();
});
