document.addEventListener('DOMContentLoaded', async () => {
    await fetchUserData();
});

async function fetchUserData() {
    try {
        const response = await fetch('/api/user/profile', {
            credentials: 'include'  // Important for session cookies
        });
        
        if (!response.ok) {
            throw new Error('Not authenticated');
        }

        const data = await response.json();
        if (data.success) {
            document.getElementById('username-display').textContent = data.username;
        } else {
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Error:', error);
        window.location.href = '/login';
    }
}

async function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('generated-password').textContent = password;
}

async function copyPassword() {
    const password = document.getElementById('generated-password').textContent;
    if (password) {
        try {
            await navigator.clipboard.writeText(password);
            alert('Password copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
}

function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const result = zxcvbn(password);
    const resultElement = document.getElementById('password-strength-result');
    resultElement.textContent = `Strength: ${result.score}/4 - ${result.feedback.warning || 'Strong password!'}`;
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function handleLogout() {
    localStorage.clear();
    window.location.href = '/';
}

// Make functions globally available
window.generatePassword = generatePassword;
window.copyPassword = copyPassword;
window.checkPasswordStrength = checkPasswordStrength;
window.togglePassword = togglePassword;
window.handleLogout = handleLogout;
