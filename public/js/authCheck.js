function checkAuth() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const isAdmin = localStorage.getItem('adminToken');
    return isLoggedIn === 'true' || isAdmin;
}

// Check auth on password tool page
if (window.location.pathname.includes('password-tool.html')) {
    if (!checkAuth()) {
        window.location.href = 'login.html';
    }
}

// Function for checking auth before redirects
function checkAuthAndRedirect(page) {
    if (!localStorage.getItem('isLoggedIn')) {
        alert('Please login to access the tools');
        window.location.href = 'login.html';
        return;
    }
    window.location.href = page;
}
