document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    loginForm.insertBefore(errorMessage, loginForm.firstChild);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        errorMessage.textContent = '';

        // Basic client-side validation
        if (!username || !password) {
            errorMessage.textContent = 'Please fill in all fields';
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Successful login
                localStorage.setItem('token', data.token);
                window.location.href = '/password-tool.html';
            } else {
                // Failed login
                errorMessage.textContent = data.message || 'Invalid username or password';
            }
        } catch (error) {
            errorMessage.textContent = 'An error occurred. Please try again.';
            console.error('Login error:', error);
        }
    });
});
