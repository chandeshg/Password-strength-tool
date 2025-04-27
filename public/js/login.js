document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.querySelector('.error-message');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({ 
                    email: document.getElementById('email').value.trim(),
                    password: document.getElementById('password').value.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            if (data.success) {
                window.location.href = data.redirect;
            } else {
                showError(data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Connection error. Please try again.');
        }
    });

    // Add password toggle function
    window.togglePassword = function(inputId) {
        const input = document.getElementById(inputId);
        const icon = input.nextElementSibling.querySelector('i');
        input.type = input.type === 'password' ? 'text' : 'password';
        icon.className = `fas fa-eye${input.type === 'password' ? '' : '-slash'}`;
    };
});
