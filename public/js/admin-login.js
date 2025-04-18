document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.querySelector('.error-message');
    
    if (username === 'admin' && password === 'SecureAdmin123!') {
        // Set only admin token, not user authentication
        localStorage.setItem('adminToken', 'admin-session');
        localStorage.setItem('username', 'Admin');
        window.location.href = 'admin.html';
    } else {
        errorMessage.textContent = 'Invalid admin credentials';
        errorMessage.style.display = 'block';
    }
});
