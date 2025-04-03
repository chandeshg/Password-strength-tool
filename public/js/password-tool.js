// Password Generator
function generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('generated-password').textContent = password;
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
    const password = document.getElementById('history-password').value;
    if (passwordHistory.includes(password)) {
        document.getElementById('history-check-result').textContent = 'This password has been used before!';
    } else {
        document.getElementById('history-check-result').textContent = 'This password is new.';
        passwordHistory.push(password); // Add to history
    }
}

// Ensure all functions are defined globally and match the HTML button onclick attributes
window.generatePassword = generatePassword;
window.checkEmail = checkEmail;
window.checkPasswordStrength = checkPasswordStrength;
window.checkPasswordHistory = checkPasswordHistory;
