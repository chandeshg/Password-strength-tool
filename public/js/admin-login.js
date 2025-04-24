document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('admin-login-form');
    const errorMessage = document.querySelector('.error-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                    throw new Error('Login failed');
                }

                const data = await response.json();

                if (data.success) {
                    window.location.href = data.redirect || '/admin/dashboard';
                } else {
                    showError(data.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError('Connection error. Please try again.');
            }
        });
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }
});
