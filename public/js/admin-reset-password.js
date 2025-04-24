document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reset-password-form');
    const messageContainer = document.getElementById('messageContainer');
    
    // Get token from URL path or query parameter
    const pathToken = window.location.pathname.split('/').pop();
    const queryToken = new URLSearchParams(window.location.search).get('token');
    const token = pathToken !== 'reset-password' ? pathToken : queryToken;

    if (!token) {
        showMessage('Invalid or missing reset token. Please request a new password reset.', 'error');
        if (form) form.style.display = 'none';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!newPassword || newPassword.length < 6) {
            showMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        try {
            const response = await fetch('/api/admin/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    token,
                    newPassword
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            if (data.success) {
                showMessage('Password updated successfully. Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = '/admin-login.html';
                }, 2000);
            }
        } catch (error) {
            showMessage(error.message || 'Error updating password', 'error');
        }
    });

    function showMessage(message, type) {
        messageContainer.textContent = message;
        messageContainer.className = `reset-message ${type}`;
    }
});
