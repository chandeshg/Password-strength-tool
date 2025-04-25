document.addEventListener('DOMContentLoaded', loadSettings);

function loadSettings() {
    // Settings loading logic here
}

// Add global logout handler
window.handleLogout = function() {
    localStorage.clear();
    window.location.href = '/';
};
