document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    
    if (!email) {
        window.location.href = 'signup.html';
        return;
    }

    document.getElementById('verify-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const code = document.getElementById('verification-code').value.trim();
        const errorMessage = document.querySelector('.error-message');
        
        try {
            const response = await fetch('http://localhost:3000/api/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
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
            errorMessage.textContent = 'An error occurred during verification';
            errorMessage.style.display = 'block';
        }
    });
});
