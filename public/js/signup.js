document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const errorMessage = document.querySelector('.error-message');

    if (!signupForm) return;

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value.trim();

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Store credentials for resend functionality
                localStorage.setItem('pendingUsername', username);
                localStorage.setItem('pendingPassword', password);
                localStorage.setItem('pendingVerificationEmail', email);
                window.location.href = `/verification.html?email=${encodeURIComponent(email)}`;
            } else {
                showError(data.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showError('Connection error. Please try again.');
        }
    });

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }
    }
});
