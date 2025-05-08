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
    const length = parseInt(document.getElementById('password-length')?.value || 12);
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
        // Enhanced error notification
        const output = document.getElementById('generated-password');
        output.innerHTML = '<span class="text-danger"><i class="fas fa-exclamation-triangle"></i> Select at least one character type</span>';
        return;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    const output = document.getElementById('generated-password');
    
    // Add fade-in animation
    output.style.opacity = '0';
    output.textContent = password;
    output.style.color = '#2c3e50';
    output.style.fontFamily = 'monospace';
    output.style.fontSize = '1.2rem';
    output.style.padding = '8px';
    output.style.borderRadius = '4px';
    output.style.backgroundColor = '#f8f9fa';
    output.style.border = '1px solid #dee2e6';
    
    // Trigger animation
    setTimeout(() => {
        output.style.transition = 'opacity 0.5s ease-in-out';
        output.style.opacity = '1';
    }, 10);
}

function analyzePassword() {
    const password = document.getElementById('password-analyze').value;
    const result = document.getElementById('analysis-result');
    
    if (!password) {
        result.innerHTML = '<div class="empty-result"><i class="fas fa-keyboard"></i> Enter a password to analyze</div>';
        return;
    }
    
    const analysis = {
        length: password.length,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumbers: /[0-9]/.test(password),
        hasSymbols: /[^A-Za-z0-9]/.test(password),
        hasCommonWords: /(password|123456|admin|qwerty)/i.test(password)
    };

    // Calculate overall score
    let score = 0;
    if (analysis.length >= 12) score++;
    if (analysis.hasUppercase) score++;
    if (analysis.hasLowercase) score++;
    if (analysis.hasNumbers) score++;
    if (analysis.hasSymbols) score++;
    if (!analysis.hasCommonWords) score++;
    
    const percentage = Math.round((score / 6) * 100);
    
    result.innerHTML = `
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${percentage}%; background-color: ${getColorForPercentage(percentage)}"></div>
        </div>
        <div class="analysis-items">
            <div class="analysis-item ${analysis.length >= 12 ? 'pass' : 'fail'}">
                <i class="fas ${analysis.length >= 12 ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                <span>Length: ${analysis.length} ${analysis.length >= 12 ? '(Good)' : '(Too short)'}</span>
            </div>
            <div class="analysis-item ${analysis.hasUppercase ? 'pass' : 'fail'}">
                <i class="fas ${analysis.hasUppercase ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                <span>Uppercase letters</span>
            </div>
            <div class="analysis-item ${analysis.hasLowercase ? 'pass' : 'fail'}">
                <i class="fas ${analysis.hasLowercase ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                <span>Lowercase letters</span>
            </div>
            <div class="analysis-item ${analysis.hasNumbers ? 'pass' : 'fail'}">
                <i class="fas ${analysis.hasNumbers ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                <span>Numbers</span>
            </div>
            <div class="analysis-item ${analysis.hasSymbols ? 'pass' : 'fail'}">
                <i class="fas ${analysis.hasSymbols ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                <span>Special characters</span>
            </div>
            <div class="analysis-item ${!analysis.hasCommonWords ? 'pass' : 'fail'}">
                <i class="fas ${!analysis.hasCommonWords ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                <span>No common patterns</span>
            </div>
        </div>
    `;
    
    // Add CSS for the analysis display
    if (!document.getElementById('analysis-styles')) {
        const style = document.createElement('style');
        style.id = 'analysis-styles';
        style.textContent = `
            .progress-bar-container {
                height: 8px;
                background-color: #e9ecef;
                border-radius: 4px;
                margin-bottom: 15px;
                overflow: hidden;
            }
            .progress-bar {
                height: 100%;
                border-radius: 4px;
                transition: width 0.6s ease;
            }
            .analysis-items {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 10px;
            }
            .analysis-item {
                display: flex;
                align-items: center;
                padding: 8px;
                border-radius: 4px;
                background-color: #f8f9fa;
                transition: all 0.3s ease;
            }
            .analysis-item i {
                margin-right: 8px;
                font-size: 1.2rem;
            }
            .analysis-item.pass i {
                color: #198754;
            }
            .analysis-item.fail i {
                color: #dc3545;
            }
            .analysis-item:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .empty-result {
                color: #6c757d;
                text-align: center;
                padding: 20px;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }
}

function checkPasswordStrength() {
    const password = document.getElementById('password-check').value;
    const result = document.getElementById('strength-result');
    
    if (!password) {
        result.innerHTML = '<div class="empty-result"><i class="fas fa-keyboard"></i> Enter a password to check</div>';
        return;
    }

    // Calculate strength score
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (!/password|123456|qwerty/i.test(password)) score++;

    // Map score to strength
    const maxScore = 7;
    const percentage = Math.round((score / maxScore) * 100);
    
    // Enhanced visual feedback with animated meter
    const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong', 'Excellent'];
    const strengthIndex = Math.min(Math.floor(score * (strengthLevels.length / maxScore)), strengthLevels.length - 1);
    const strength = strengthLevels[strengthIndex];
    const color = getColorForPercentage(percentage);
    
    result.innerHTML = `
        <div class="strength-meter-container">
            <div class="strength-label">${strength}</div>
            <div class="strength-meter">
                <div class="strength-meter-fill" style="width: ${percentage}%; background-color: ${color};"></div>
            </div>
            <div class="strength-description">${getStrengthDescription(strength)}</div>
        </div>
    `;
    
    // Add CSS for the strength meter
    if (!document.getElementById('strength-styles')) {
        const style = document.createElement('style');
        style.id = 'strength-styles';
        style.textContent = `
            .strength-meter-container {
                padding: 15px;
                background-color: #f8f9fa;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            .strength-label {
                font-size: 1.5rem;
                font-weight: bold;
                text-align: center;
                margin-bottom: 10px;
                color: ${color};
            }
            .strength-meter {
                height: 10px;
                background-color: #e9ecef;
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 10px;
            }
            .strength-meter-fill {
                height: 100%;
                border-radius: 5px;
                transition: width 0.8s ease-in-out;
            }
            .strength-description {
                text-align: center;
                color: #6c757d;
                font-size: 0.9rem;
                font-style: italic;
            }
            .empty-result {
                color: #6c757d;
                text-align: center;
                padding: 20px;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }
}

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
        resultDiv.innerHTML = '<div class="alert alert-info"><i class="fas fa-info-circle"></i> Please enter a password to check</div>';
        return;
    }

    // Animated loading indicator
    resultDiv.innerHTML = `
        <div class="breach-checking">
            <div class="spinner"></div>
            <p>Checking databases securely...</p>
            <small>Your password is hashed locally and only the first 5 characters are sent</small>
        </div>
    `;

    try {
        // Hash the password (SHA-1) and take first 5 chars for k-anonymity
        const hash = await sha1(password);
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);

        // Query the Have I Been Pwned API
        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.text();
        
        // Check if password hash suffix exists in the response
        const breachCount = data.split('\n')
            .map(line => line.split(':'))
            .find(([hashSuffix]) => hashSuffix.toLowerCase() === suffix.toLowerCase());

        if (breachCount) {
            const count = parseInt(breachCount[1]).toLocaleString();
            resultDiv.innerHTML = `
                <div class="breach-result breach-found">
                    <div class="breach-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="breach-content">
                        <h3>Password Found in Data Breaches!</h3>
                        <div class="breach-count">${count}</div>
                        <p class="breach-explanation">This password has appeared in data breaches ${count} times.</p>
                        <div class="breach-recommendation">
                            <p><strong>What to do:</strong></p>
                            <ul>
                                <li>Change this password immediately if you use it anywhere</li>
                                <li>Use a unique password for each account</li>
                                <li>Consider using a password manager</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="breach-result breach-safe">
                    <div class="breach-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <div class="breach-content">
                        <h3>Good News!</h3>
                        <p>This password hasn't been found in any known data breaches.</p>
                        <div class="breach-recommendation">
                            <p>Remember to:</p>
                            <ul>
                                <li>Use different passwords for different accounts</li>
                                <li>Enable two-factor authentication when available</li>
                            </ul>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Password breach check error:', error);
        resultDiv.innerHTML = `
            <div class="breach-result breach-error">
                <div class="breach-icon">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="breach-content">
                    <h3>Error Checking Password</h3>
                    <p>We couldn't complete the breach check at this time.</p>
                    <p>Please try again later or check your connection.</p>
                </div>
            </div>
        `;
    }
    
    // Add CSS for breach results
    if (!document.getElementById('breach-styles')) {
        const style = document.createElement('style');
        style.id = 'breach-styles';
        style.textContent = `
            .breach-checking {
                text-align: center;
                padding: 20px;
                color: #6c757d;
            }
            .spinner {
                width: 40px;
                height: 40px;
                border: 4px solid rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                border-left-color: #09f;
                margin: 0 auto 15px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            .breach-result {
                display: flex;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                margin: 15px 0;
                transition: transform 0.3s ease;
            }
            .breach-result:hover {
                transform: translateY(-5px);
            }
            .breach-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                font-size: 2.5rem;
            }
            .breach-found .breach-icon {
                background-color: #ffebed;
                color: #dc3545;
            }
            .breach-safe .breach-icon {
                background-color: #e6ffee;
                color: #198754;
            }
            .breach-error .breach-icon {
                background-color: #fff3e6;
                color: #fd7e14;
            }
            .breach-content {
                padding: 20px;
                flex: 1;
            }
            .breach-found .breach-content {
                background-color: #fff5f6;
            }
            .breach-safe .breach-content {
                background-color: #f5fff8;
            }
            .breach-error .breach-content {
                background-color: #fff9f0;
            }
            .breach-content h3 {
                margin-top: 0;
                color: #2c3e50;
            }
            .breach-count {
                font-size: 2rem;
                font-weight: bold;
                color: #dc3545;
                text-align: center;
                margin: 10px 0;
            }
            .breach-explanation {
                margin-bottom: 15px;
                color: #6c757d;
            }
            .breach-recommendation {
                background-color: rgba(255, 255, 255, 0.7);
                padding: 10px;
                border-radius: 5px;
            }
            .breach-recommendation ul {
                margin-top: 5px;
                padding-left: 20px;
            }
            .alert {
                padding: 12px 16px;
                border-radius: 4px;
                margin-bottom: 15px;
            }
            .alert-info {
                background-color: #e8f4fd;
                color: #0c5460;
                border-left: 4px solid #17a2b8;
            }
            .alert i {
                margin-right: 8px;
            }
        `;
        document.head.appendChild(style);
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
    if (!password || password.includes('Select at least one character type')) {
        return;
    }

    navigator.clipboard.writeText(password)
        .then(() => {
            const copyBtn = document.querySelector('.btn-secondary');
            const originalText = copyBtn.innerHTML;
            
            // Enhanced copy feedback
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.classList.add('copy-success');
            
            // Reset button after 2 seconds
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('copy-success');
            }, 2000);
            
            // Show toast notification
            showToast('Password copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            showToast('Failed to copy password', 'error');
        });
}

// Toast notification function
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);
        
        // Add toast styles
        const style = document.createElement('style');
        style.textContent = `
            #toast-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
            }
            .toast {
                min-width: 250px;
                margin-top: 10px;
                padding: 12px 20px;
                border-radius: 5px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                animation: slideIn 0.3s, fadeOut 0.5s 2.5s forwards;
                display: flex;
                align-items: center;
            }
            .toast.success {
                background-color: #d4edda;
                color: #155724;
                border-left: 4px solid #28a745;
            }
            .toast.error {
                background-color: #f8d7da;
                color: #721c24;
                border-left: 4px solid #dc3545;
            }
            .toast i {
                margin-right: 10px;
                font-size: 1.2rem;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; visibility: hidden; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Remove after animation completes
    setTimeout(() => {
        toast.remove();
    }, 3000);
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

// Helper function to get color based on percentage
function getColorForPercentage(percentage) {
    if (percentage < 20) return '#dc3545'; // red
    if (percentage < 40) return '#ffc107'; // yellow
    if (percentage < 60) return '#fd7e14'; // orange
    if (percentage < 80) return '#20c997'; // teal
    return '#198754'; // green
}

// Helper function to get strength description
function getStrengthDescription(strength) {
    switch (strength) {
        case 'Very Weak':
            return 'This password would be easily cracked. Not recommended for use.';
        case 'Weak':
            return 'This password is not secure enough for sensitive accounts.';
        case 'Fair':
            return 'This password provides basic security but could be stronger.';
        case 'Good':
            return 'This password offers reasonable security for most purposes.';
        case 'Strong':
            return 'This is a strong password that would be difficult to crack.';
        case 'Very Strong':
            return 'Excellent password choice with high security.';
        case 'Excellent':
            return 'Outstanding password with maximum security!';
        default:
            return '';
    }
}

// Password Generator Functionality
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    
    if (generateBtn) {
        generateBtn.addEventListener('click', generatePassword);
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', copyPassword);
    }
});

function generatePassword() {
    const includeUppercase = document.getElementById('include-uppercase').checked;
    const includeLowercase = document.getElementById('include-lowercase').checked;
    const includeNumbers = document.getElementById('include-numbers').checked;
    const includeSymbols = document.getElementById('include-symbols').checked;
    
    // Ensure at least one character type is selected
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
        document.getElementById('generated-password').innerText = 'Please select at least one character type';
        return;
    }
    
    const length = 16; // You can make this configurable later
    const password = createPassword(length, includeUppercase, includeLowercase, includeNumbers, includeSymbols);
    
    document.getElementById('generated-password').innerText = password;
}

function createPassword(length, upper, lower, numbers, symbols) {
    const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()-_=+[]{}|;:,.<>?/';
    
    let allowedChars = '';
    if (upper) allowedChars += upperChars;
    if (lower) allowedChars += lowerChars;
    if (numbers) allowedChars += numberChars;
    if (symbols) allowedChars += symbolChars;
    
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allowedChars.length);
        password += allowedChars[randomIndex];
    }
    
    return password;
}

function copyPassword() {
    const passwordText = document.getElementById('generated-password').innerText;
    
    if (passwordText && passwordText !== 'Click Generate to create password' && 
        !passwordText.includes('Please select')) {
        navigator.clipboard.writeText(passwordText)
            .then(() => {
                const notification = document.getElementById('copy-notification');
                notification.style.display = 'inline-block';
                
                setTimeout(() => {
                    notification.style.display = 'none';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    }
}
