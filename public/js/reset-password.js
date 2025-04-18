document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    document.getElementById('reset-token').value = token;
});

document.getElementById('reset-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = document.getElementById('reset-token').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorMessage = document.querySelector('.error-message');
    
    // Password validation
    if (newPassword !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match';
        errorMessage.style.display = 'block';
        return;
    }
    
    if (newPassword.length < 8) {
        errorMessage.textContent = 'Password must be at least 8 characters long';
        errorMessage.style.display = 'block';
        return;
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/reset-password', {
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
        
        if (response.ok) {
            alert('Password has been reset successfully!');
            window.location.href = 'login.html';
        } else {
            errorMessage.textContent = data.message;
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    }
});
