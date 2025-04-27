document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('admin-login-form');
    const errorMessage = document.querySelector('.error-message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username')?.value.trim();
            const password = document.getElementById('password')?.value.trim();

            console.log('Attempting admin login:', { username });

            if (!username || !password) {
                showError('Username and password are required');
                return;
            }

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                console.log('Admin login response:', response.status, data);

                if (response.ok && data.success) {
                    localStorage.setItem('adminToken', 'true');
                    window.location.href = data.redirect;
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
