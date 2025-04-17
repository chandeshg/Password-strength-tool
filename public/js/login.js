document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    loginForm.insertBefore(errorMessage, loginForm.firstChild);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorMessage = document.querySelector('.error-message') || createErrorElement();

        // Reset any existing error messages
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store user data in localStorage
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('username', data.username);
                localStorage.setItem('isLoggedIn', 'true');
                
                // Redirect to tools page
                window.location.href = 'password-tool.html';
            } else {
                // Show error message
                errorMessage.textContent = data.message || 'Login failed';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'Server connection error';
            errorMessage.style.display = 'block';
        }
    });

    function showError(message) {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function createErrorElement() {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        const form = document.getElementById('login-form');
        form.insertBefore(errorDiv, form.firstChild);
        return errorDiv;
    }
});
