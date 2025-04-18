// Password Generator
async function generatePassword() {
    const button = document.querySelector('.primary-btn');
    const originalText = button.innerHTML;
    
    // Show processing animation
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    button.disabled = true;

    // Add delay to show processing
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate a strong password
    const length = 16;
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()_-+=';
    
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    let password = '';
    
    // Ensure at least one character from each type
    password += uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
    password += lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
    password += numberChars[Math.floor(Math.random() * numberChars.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill rest of the password
    for (let i = 4; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    // Display the generated password
    const outputElement = document.getElementById('generated-password');
    outputElement.textContent = password;
    outputElement.style.display = 'block';

    // Reset button state
    button.innerHTML = '<i class="fas fa-cog"></i> Generate Password';
    button.disabled = false;
}

// I Have Been Pwned Email Checker
async function checkEmail() {
    const email = document.getElementById('email').value;

    // Ensure the API key is provided
    const apiKey = 'your-api-key-here'; // Replace with your actual API key
    if (!apiKey || apiKey === 'your-api-key-here') {
        document.getElementById('email-check-result').textContent = 'Error: Missing or invalid API key.';
        return;
    }

    try {
        const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
            headers: {
                'hibp-api-key': apiKey,
                'User-Agent': 'PasswordStrengthTool'
            }
        });

        if (response.status === 200) {
            document.getElementById('email-check-result').textContent = 'Your email has been pwned!';
        } else if (response.status === 404) {
            document.getElementById('email-check-result').textContent = 'Your email is safe.';
        } else {
            document.getElementById('email-check-result').textContent = `Error: ${response.status} - ${response.statusText}`;
        }
    } catch (error) {
        console.error('Error checking email:', error);
        document.getElementById('email-check-result').textContent = 'Error: Unable to check email.';
    }
}

// Password Strength Checker
function checkPasswordStrength() {
    const password = document.getElementById('password').value;

    // Ensure zxcvbn is loaded and used correctly
    if (typeof zxcvbn !== 'function') {
        console.error('zxcvbn library is not loaded.');
        document.getElementById('password-strength-result').textContent = 'Error: Strength checker not available.';
        return;
    }

    const strength = zxcvbn(password);
    document.getElementById('password-strength-result').textContent = `Strength: ${strength.score}/4 - ${strength.feedback.suggestions.join(' ') || 'Good password!'}`;
}

// Password History Checker
const passwordHistory = []; // Store previously used passwords locally
function checkPasswordHistory() {
    const password = document.getElementById('history-password').value.trim();
    const resultElement = document.getElementById('history-check-result');

    // Validate empty password
    if (!password) {
        resultElement.textContent = 'Please enter a password to check';
        resultElement.style.color = '#e74c3c';  // Red color for error
        return;
    }

    if (passwordHistory.includes(password)) {
        resultElement.textContent = 'This password has been used before!';
        resultElement.style.color = '#e74c3c';  // Red color for warning
    } else {
        resultElement.textContent = 'This password hasn\'t been used before.';
        resultElement.style.color = '#27ae60';  // Green color for success
        passwordHistory.push(password);
    }
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

// Ensure all functions are defined globally and match the HTML button onclick attributes
window.generatePassword = generatePassword;
window.checkEmail = checkEmail;
window.checkPasswordStrength = checkPasswordStrength;
window.checkPasswordHistory = checkPasswordHistory;

function logout() {
    // Clear user data from localStorage
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    localStorage.removeItem('isLoggedIn');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    // Add logout handler
    document.querySelector('.login-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    // Display username
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('username-display').textContent = username;
    }
    
    // Get logged in user's email
    const userEmail = localStorage.getItem('userEmail');
    
    // Auto check for email breach
    if (userEmail) {
        const breachResults = document.getElementById('breach-results');
        try {
            const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${userEmail}`, {
                headers: {
                    'hibp-api-key': 'your-api-key' // Replace with actual HIBP API key
                }
            });
            
            if (response.ok) {
                const breaches = await response.json();
                breachResults.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        Your email was found in ${breaches.length} data breaches.
                        <button onclick="showBreachDetails(${JSON.stringify(breaches)})">
                            View Details
                        </button>
                    </div>`;
            } else if (response.status === 404) {
                breachResults.innerHTML = `
                    <div class="alert alert-success">
                        <i class="fas fa-check-circle"></i>
                        Good news! Your email hasn't been found in any known data breaches.
                    </div>`;
            }
        } catch (error) {
            console.error('Error checking breach:', error);
        }
    }
    
    // Add admin dashboard link if user is admin
    if (localStorage.getItem('isAdmin') === 'true') {
        const nav = document.querySelector('header nav ul');
        const adminLink = document.createElement('li');
        adminLink.innerHTML = '<a href="admin.html" class="admin-btn">Admin Dashboard</a>';
        nav.appendChild(adminLink);
    }
});

function showBreachDetails(breaches) {
    const modal = document.createElement('div');
    modal.className = 'breach-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Breach Details</h3>
            <div class="breach-list">
                ${breaches.map(breach => `
                    <div class="breach-item">
                        <h4>${breach.Name}</h4>
                        <p>Date: ${new Date(breach.BreachDate).toLocaleDateString()}</p>
                        <p>${breach.Description}</p>
                    </div>
                `).join('')}
            </div>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

// Add event listener for the generate button
document.querySelector('.primary-btn').addEventListener('click', generatePassword);
