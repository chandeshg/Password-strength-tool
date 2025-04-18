document.getElementById('forgot-password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const errorMessage = document.querySelector('.error-message');
    const submitButton = document.querySelector('button[type="submit"]');
    
    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    errorMessage.style.display = 'none';
    
    try {
        const response = await fetch('http://localhost:3000/api/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Password reset instructions have been sent to your email.');
            window.location.href = 'login.html';
        } else {
            errorMessage.textContent = data.message;
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
    } finally {
        // Re-enable button and restore text
        submitButton.disabled = false;
        submitButton.innerHTML = 'Send Reset Link <i class="fas fa-paper-plane"></i>';
    }
});
