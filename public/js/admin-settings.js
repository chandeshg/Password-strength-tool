document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
});

async function loadSettings() {
    try {
        const response = await fetch('/api/admin/settings');
        const data = await response.json();
        if (data.success) {
            populateSettings(data.settings);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

function populateSettings(settings) {
    document.getElementById('emailNotifications').checked = settings.emailNotifications;
    document.getElementById('defaultRole').value = settings.defaultRole;
}

function setupEventListeners() {
    document.getElementById('settingsForm').addEventListener('submit', saveSettings);
}

async function saveSettings(e) {
    e.preventDefault();
    // Add your save settings logic here
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        fetch('/api/admin/logout', {
            method: 'POST'
        }).then(() => {
            window.location.href = '/admin-login.html';
        });
    }
}
