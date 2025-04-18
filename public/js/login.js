document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    loginForm.insertBefore(errorMessage, loginForm.firstChild);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorMessage = document.querySelector('.error-message');
        
        try {
            // Check for admin login
            if (username === 'admin' && password === 'SecureAdmin123!') {
                localStorage.setItem('adminToken', 'admin-session');
                window.location.href = 'admin.html';
                return;
            }

            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Store auth data
                localStorage.setItem('userToken', data.userId);
                localStorage.setItem('username', data.username);
                localStorage.setItem('isLoggedIn', 'true');
                
                // Redirect to tool page
                window.location.href = 'password-tool.html';
            } else {
                errorMessage.textContent = data.message;
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'An error occurred during login';
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
