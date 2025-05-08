document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/user', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        if (data.username) {
            document.getElementById('nav-username').textContent = data.username;
            document.getElementById('dropdown-username').textContent = data.username;
            document.getElementById('dropdown-email').textContent = data.email;
            
            // Auto-fill email field if user is logged in
            const emailInput = document.getElementById('email-input');
            if (emailInput && data.email) {
                emailInput.value = data.email;
            }
        }
    })
    .catch(console.error);
});

// Enhanced dropdown functionality
document.addEventListener('DOMContentLoaded', () => {
    const profileBtn = document.querySelector('.profile-btn');
    const profileDropdown = document.querySelector('.profile-dropdown');
    const dropdown = document.querySelector('.dropdown-content');

    // Toggle dropdown on button click
    profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
        dropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
            profileDropdown.classList.remove('active');
            dropdown.classList.remove('show');
        }
    });
    
    // Add hover effect for dropdown items
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        const icon = item.querySelector('i');
        item.addEventListener('mouseenter', () => {
            if (!item.classList.contains('text-danger')) {
                icon.style.color = '#4776E6';
            }
        });
        item.addEventListener('mouseleave', () => {
            if (!item.classList.contains('text-danger')) {
                icon.style.color = '';
            }
        });
    });
});

// Fix the logout functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener to logout button
    const logoutBtn = document.querySelector('[onclick="handleLogout()"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
});

async function checkEmailBreach() {
    const email = document.getElementById('email-check').value;
    const loading = document.getElementById('loading');
    const resultBox = document.getElementById('breach-result');

    if (!email) {
        showError('Please enter an email address');
        return;
    }

    try {
        loading.style.display = 'block';
        resultBox.style.display = 'none';

        // Comment: The API key should be provided by the server to avoid exposing it in client-side code
        // For now, we'll handle the error case since the API call will likely fail
        const response = await fetch(`/api/check-email-breach?email=${encodeURIComponent(email)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        loading.style.display = 'none';

        if (response.status === 404) {
            showSafeResult(email);
        } else if (response.ok) {
            const data = await response.json();
            if (data.breaches && data.breaches.length > 0) {
                showBreachResult(email, data.breaches);
            } else {
                showSafeResult(email);
            }
        } else {
            const data = await response.json();
            showError(data.message || 'Error checking email. Please try again later.');
        }
    } catch (error) {
        console.error('Email breach check error:', error);
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

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function handleLogout() {
    console.log('Logging out...');
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
    })
    .then(response => {
        console.log('Logout response:', response);
        window.location.href = '/login.html';
    })
    .catch(error => {
        console.error('Logout error:', error);
        // Even if there's an error, redirect to login
        window.location.href = '/login.html';
    });
}

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
