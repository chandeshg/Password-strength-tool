document.addEventListener('DOMContentLoaded', () => {
    const verifyForm = document.getElementById('verify-form');
    const resendBtn = document.getElementById('resend-code');
    const errorMessage = document.querySelector('.error-message');
    
    const email = new URLSearchParams(window.location.search).get('email');
    if (!email) {
        showError('Email not found in URL');
        return;
    }

    verifyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('verification-code').value;
        handleVerification(code);
    });

    async function handleVerification(code) {
        try {
            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, code })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showSuccess('Account verified successfully! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } else {
                showError(data.message || 'Verification failed');
            }
        } catch (error) {
            showError('Error during verification');
        }
    }

    resendBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    username: localStorage.getItem('pendingUsername'),
                    password: localStorage.getItem('pendingPassword'),
                    resending: true
                })
            });

            const data = await response.json();
            if (response.ok) {
                showSuccess('New verification code sent!');
            } else {
                showError(data.message || 'Failed to resend code');
            }
        } catch (error) {
            showError('Error resending verification code');
        }
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.className = 'error-message error';
    }

    function showSuccess(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.className = 'error-message success';
    }
});
