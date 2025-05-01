document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');
    const errorDiv = document.querySelector('.error-message');
    const submitBtn = loginForm?.querySelector('button[type="submit"]');
    
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    function showError(message) {
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;

        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                window.location.href = data.redirect;
            } else if (data.needsVerification) {
                window.location.href = `/verification.html?email=${encodeURIComponent(email)}`;
            } else {
                showError(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Connection error. Please try again.');
        }
    });
});
