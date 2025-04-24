document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    const messageContainer = document.getElementById('messageContainer');
    const serverUrl = 'http://localhost:3000'; // Add server URL

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const usernameInput = document.getElementById('username');
            if (!usernameInput) {
                showMessage('Form error: Username input not found', 'error');
                return;
            }

            try {
                const response = await fetch(`${serverUrl}/api/admin/forgot-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ username: usernameInput.value })
                });
                
                const data = await response.json();
                showMessage(data.message, data.success ? 'success' : 'error');
            } catch (error) {
                console.error('Request error:', error);
                showMessage('Connection error. Please try again.', 'error');
            }
        });
    }

    function showMessage(message, type) {
        if (messageContainer) {
            messageContainer.textContent = message;
            messageContainer.className = `reset-message ${type}`;
        }
    }
});
