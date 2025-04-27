document.addEventListener('DOMContentLoaded', () => {
    const verifyForm = document.getElementById('verify-form');
    const resendBtn = document.getElementById('resend-code');
    const errorMessage = document.querySelector('.error-message');
    
    const email = new URLSearchParams(window.location.search).get('email');
    if (!email) {
        showError('Email not found in URL');
        return;
    }

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

    if (verifyForm) {
        verifyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const code = document.getElementById('verification-code').value;
            await handleVerification(code);
        });
    }

    resendBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            const storedEmail = new URLSearchParams(window.location.search).get('email');
            const storedUsername = localStorage.getItem('pendingUsername');
            const storedPassword = localStorage.getItem('pendingPassword');

            if (!storedEmail || !storedUsername || !storedPassword) {
                showError('Missing registration information. Please sign up again.');
                setTimeout(() => {
                    window.location.href = '/signup.html';
                }, 2000);
                return;
            }

            const response = await fetch('/api/resend-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: storedEmail,
                    username: storedUsername,
                    password: storedPassword
                })
            });

            const data = await response.json();
            if (response.ok) {
                showSuccess('Verification code resent. Please check your email.');
            } else {
                showError(data.message || 'Failed to resend code');
            }
        } catch (error) {
            console.error('Resend error:', error);
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
