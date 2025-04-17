document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.querySelector('.error-message');

    errorMessage.style.display = 'none';
    
    try {
        const response = await fetch('http://localhost:3000/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            window.location.href = `http://localhost:3000/verification.html?email=${encodeURIComponent(email)}`;
        } else {
            errorMessage.textContent = data.message;
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Signup error:', error);
        errorMessage.textContent = 'An error occurred during signup';
        errorMessage.style.display = 'block';
    }
});

// Add verification code handler
document.getElementById('verify-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const code = document.getElementById('verification-code').value.trim();
    const email = localStorage.getItem('pendingVerificationEmail');
    const errorMessage = document.querySelector('.error-message');

    try {
        const response = await fetch('http://localhost:3000/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Account verified successfully! Please login.');
            window.location.href = 'login.html';
        } else {
            errorMessage.textContent = data.message;
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Verification error:', error);
        errorMessage.textContent = 'Error during verification';
        errorMessage.style.display = 'block';
    }
});

function showError(message) {
    const errorMessage = document.querySelector('.error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
