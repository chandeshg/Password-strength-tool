async function checkEmailBreach() {
    const email = document.getElementById('email-check').value;
    const loading = document.getElementById('loading');
    const resultBox = document.getElementById('breach-result');

    if (!email) {
        showResult('Please enter an email address', 'warning');
        return;
    }

    try {
        loading.style.display = 'block';
        resultBox.style.display = 'none';

        const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}`, {
            headers: {
                'hibp-api-key': 'your-api-key'
            }
        });

        loading.style.display = 'none';

        if (response.status === 404) {
            showSafeResult(email);
        } else if (response.ok) {
            const breaches = await response.json();
            showBreachResult(email, breaches);
        } else {
            showError('Error checking email. Please try again later.');
        }
    } catch (error) {
        loading.style.display = 'none';
        showError('Service temporarily unavailable. Please try again later.');
    }
}

function showSafeResult(email) {
    const resultBox = document.getElementById('breach-result');
    resultBox.className = 'result-section safe';
    resultBox.innerHTML = `
        <div class="result-header">
            <i class="fas fa-check-circle"></i>
            <h3>Good News!</h3>
        </div>
        <p>${email} was not found in any known data breaches. Keep up the good security practices!</p>
        <div class="security-tips">
            <h4>Security Tips:</h4>
            <ul>
                <li>Use strong, unique passwords for each account</li>
                <li>Enable two-factor authentication when possible</li>
                <li>Regularly monitor your accounts for suspicious activity</li>
            </ul>
        </div>
    `;
    resultBox.style.display = 'block';
}

function showBreachResult(email, breaches) {
    const resultBox = document.getElementById('breach-result');
    resultBox.className = 'result-section warning';
    resultBox.innerHTML = `
        <div class="result-header">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Breaches Found</h3>
        </div>
        <p>${email} was found in ${breaches.length} data breach${breaches.length > 1 ? 'es' : ''}:</p>
        <div class="breach-list">
            ${breaches.map(breach => `
                <div class="breach-item">
                    <h4>${breach.Name}</h4>
                    <p><strong>Breach date:</strong> ${new Date(breach.BreachDate).toLocaleDateString()}</p>
                    <p>${breach.Description}</p>
                </div>
            `).join('')}
        </div>
        <div class="action-steps">
            <h4>Recommended Actions:</h4>
            <ul>
                <li>Change your password immediately</li>
                <li>Enable two-factor authentication</li>
                <li>Check other accounts using similar passwords</li>
            </ul>
        </div>
    `;
    resultBox.style.display = 'block';
}

function showError(message) {
    const resultBox = document.getElementById('breach-result');
    resultBox.className = 'result-section error';
    resultBox.innerHTML = `
        <div class="result-header">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Error</h3>
        </div>
        <p>${message}</p>
    `;
    resultBox.style.display = 'block';
}
