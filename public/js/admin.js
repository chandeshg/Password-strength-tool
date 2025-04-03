document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin page script loaded."); // Debug log
    const usersTableBody = document.querySelector("#users-table tbody");
    const noDataMessage = document.getElementById("no-data-message");

    try {
        const users = [
            { id: 1, username: "admin", email: "admin@example.com" },
            { id: 2, username: "user1", email: "user1@example.com" }
        ];

        if (users.length === 0) {
            noDataMessage.style.display = "block";
            console.log("No users found."); // Debug log
        } else {
            noDataMessage.style.display = "none";
            users.forEach(user => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.email}</td>
                    <td>
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </td>
                `;
                usersTableBody.appendChild(row);
            });
            console.log("User table populated."); // Debug log
        }
    } catch (error) {
        console.error("Error populating users:", error);
    }
});
