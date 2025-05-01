document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/user', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.username) {
            document.getElementById('username-display').textContent = data.username;
            document.getElementById('nav-username').textContent = data.username;
            document.getElementById('dropdown-username').textContent = data.username;
            document.getElementById('dropdown-email').textContent = data.email;
        }
    })
    .catch(console.error);
});

// Add dropdown functionality
document.addEventListener('DOMContentLoaded', () => {
    const profileBtn = document.querySelector('.profile-btn');
    const dropdown = document.querySelector('.dropdown-content');

    // Toggle dropdown on button click
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });
});

function generatePassword() {
    const length = 12; // Fixed length
    const useLower = document.getElementById('include-lowercase').checked;
    const useUpper = document.getElementById('include-uppercase').checked;
    const useNumbers = document.getElementById('include-numbers').checked;
    const useSymbols = document.getElementById('include-symbols').checked;
    
    let charset = '';
    if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) {
        alert('Please select at least one character type');
        return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    const output = document.getElementById('generated-password');
    output.textContent = password;
    output.style.color = '#2c3e50';
}

function analyzePassword() {
    const password = document.getElementById('password-analyze').value;
    const result = document.getElementById('analysis-result');
    
    const analysis = {
        length: password.length,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumbers: /[0-9]/.test(password),
        hasSymbols: /[^A-Za-z0-9]/.test(password),
        hasCommonWords: /(password|123456|admin|qwerty)/i.test(password)
    };

    result.innerHTML = `
        <div>Length: ${analysis.length} ${analysis.length >= 12 ? '✅' : '⚠️'}</div>
        <div>Uppercase: ${analysis.hasUppercase ? '✅' : '⚠️'}</div>
        <div>Lowercase: ${analysis.hasLowercase ? '✅' : '⚠️'}</div>
        <div>Numbers: ${analysis.hasNumbers ? '✅' : '⚠️'}</div>
        <div>Symbols: ${analysis.hasSymbols ? '✅' : '⚠️'}</div>
        <div>Common Patterns: ${!analysis.hasCommonWords ? '✅' : '⚠️'}</div>
    `;
}

function checkPasswordStrength() {
    const password = document.getElementById('password-check').value;
    const result = document.getElementById('strength-result');
    
    if (!password) {
        result.innerHTML = '<span style="color: #666;">Enter a password to check</span>';
        return;
    }

    // Calculate strength score
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (!/password|123456|qwerty/i.test(password)) score++;

    // Show only strength level
    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = ['#dc3545', '#ffc107', '#fd7e14', '#20c997', '#198754', '#0d6efd'];
    
    result.innerHTML = `
        <h3 style="color: ${strengthColors[score-1]}; text-align: center; font-size: 1.5rem;">
            ${strengthLevels[score-1] || 'Very Weak'}
        </h3>
    `;
}

// Add real-time checking
document.getElementById('password-check')?.addEventListener('input', checkPasswordStrength);

function togglePasswordVisibility(inputId) {
    const passwordInput = document.getElementById(inputId);
    const toggleButton = document.querySelector(`[data-toggle="${inputId}"]`);
    const icon = toggleButton.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    }
}

async function checkPasswordBreach() {
    const password = document.getElementById('password-breach').value;
    const resultDiv = document.getElementById('breach-result');

    if (!password) {
        resultDiv.innerHTML = '<span style="color: #666;">Please enter a password to check</span>';
        return;
    }

    try {
        // Hash the password (SHA-1) and take first 5 chars for k-anonymity
        const hash = await sha1(password);
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);

        // Query the Have I Been Pwned API
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        const data = await response.text();
        
        // Check if password hash suffix exists in the response
        const breachCount = data.split('\n')
            .map(line => line.split(':'))
            .find(([hashSuffix]) => hashSuffix.toLowerCase() === suffix.toLowerCase());

        if (breachCount) {
            resultDiv.innerHTML = `
                <div style="color: #dc3545; text-align: center;">
                    <i class="fas fa-exclamation-circle" style="font-size: 24px;"></i>
                    <h3>Password Found in Data Breaches!</h3>
                    <p>This password has been found ${breachCount[1]} times in known data breaches.</p>
                    <p style="color: #666;">Consider using a different password.</p>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div style="color: #198754; text-align: center;">
                    <i class="fas fa-check-circle" style="font-size: 24px;"></i>
                    <h3>Good News!</h3>
                    <p>This password hasn't been found in any known data breaches.</p>
                </div>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = '<span style="color: #dc3545;">Error checking password. Please try again.</span>';
    }
}

// SHA-1 hash function
async function sha1(str) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function copyPassword() {
    const password = document.getElementById('generated-password').textContent;
    if (password === 'Click Generate to create password') {
        return;
    }

    navigator.clipboard.writeText(password)
        .then(() => {
            const copyBtn = document.querySelector('.btn-secondary');
            const originalText = copyBtn.innerHTML;
            
            // Show feedback
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            
            // Reset button after 2 seconds
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy password');
        });
}

// Add logout handler
function handleLogout() {
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(() => {
        window.location.href = '/login';
    })
    .catch(() => {
        window.location.href = '/login';
    });
}

// Remove the broken dashboard event listener - the href in HTML will handle navigation

function confirmDeleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        fetch('/api/user/delete', {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Account deleted successfully');
                window.location.href = '/welcome';
            } else {
                alert(data.message || 'Failed to delete account');
            }
        })
        .catch(err => {
            console.error('Delete error:', err);
            alert('Error deleting account');
        });
    }
}
