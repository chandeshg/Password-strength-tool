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
    const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${email}`, {
        headers: { 'hibp-api-key': 'your-api-key-here' }
    });
    if (response.status === 200) {
        document.getElementById('email-check-result').textContent = 'Your email has been pwned!';
    } else {
        document.getElementById('email-check-result').textContent = 'Your email is safe.';
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

// Password Entropy Calculator
function calculateEntropy() {
    const password = document.getElementById('entropy-password').value;
    const uniqueChars = new Set(password).size;
    const entropy = Math.log2(Math.pow(uniqueChars, password.length));
    document.getElementById('entropy-result').textContent = `Entropy: ${entropy.toFixed(2)} bits`;
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

// Password Policy Validator
function validatePasswordPolicy() {
    const password = document.getElementById('policy-password').value;
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (
        password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar
    ) {
        document.getElementById('policy-validation-result').textContent = 'Password meets all policy requirements!';
    } else {
        document.getElementById('policy-validation-result').textContent = 'Password does not meet policy requirements.';
    }
}

// Ensure all functions are defined globally and match the HTML button onclick attributes
window.generatePassword = generatePassword;
window.checkEmail = checkEmail;
window.checkPasswordStrength = checkPasswordStrength;
window.checkPasswordHistory = checkPasswordHistory;
window.validatePasswordPolicy = validatePasswordPolicy;
