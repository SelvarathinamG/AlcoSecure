/**
 * Main JavaScript for Landing Page
 * Handles login and registration
 */

const API_URL = 'http://localhost:5000/api';

// User Login
document.getElementById('userLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch(`${API_URL}/auth/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('userRole', 'user');
            localStorage.setItem('userName', result.user.name);
            showMessage('userMessage', 'success', 'Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/user-dashboard';
            }, 1000);
        } else {
            showMessage('userMessage', 'danger', result.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('userMessage', 'danger', 'Connection error. Please try again.');
    }
});

// User Registration
document.getElementById('userRegisterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        aadhaar: formData.get('aadhaar')
    };

    try {
        const response = await fetch(`${API_URL}/auth/user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('userRole', 'user');
            localStorage.setItem('userName', result.user.name);
            showMessage('userMessage', 'success', 'Registration successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/user-dashboard';
            }, 1000);
        } else {
            showMessage('userMessage', 'danger', result.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('userMessage', 'danger', 'Connection error. Please try again.');
    }
});

// Vendor Login
document.getElementById('vendorLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch(`${API_URL}/auth/vendor/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('userRole', 'vendor');
            localStorage.setItem('shopName', result.user.shopName);
            showMessage('vendorMessage', 'success', 'Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/vendor-dashboard';
            }, 1000);
        } else {
            showMessage('vendorMessage', 'danger', result.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('vendorMessage', 'danger', 'Connection error. Please try again.');
    }
});

// Vendor Registration
document.getElementById('vendorRegisterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        shopName: formData.get('shopName'),
        licenseNumber: formData.get('licenseNumber'),
        address: formData.get('address'),
        phone: formData.get('phone')
    };

    try {
        const response = await fetch(`${API_URL}/auth/vendor/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('userRole', 'vendor');
            localStorage.setItem('shopName', result.user.shopName);
            showMessage('vendorRegMessage', 'success', 'Registration successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/vendor-dashboard';
            }, 1000);
        } else {
            showMessage('vendorRegMessage', 'danger', result.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('vendorRegMessage', 'danger', 'Connection error. Please try again.');
    }
});

// Admin Login
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };

    try {
        const response = await fetch(`${API_URL}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('adminName', result.user.name);
            showMessage('adminMessage', 'success', 'Login successful! Redirecting...');
            setTimeout(() => {
                window.location.href = '/admin-dashboard';
            }, 1000);
        } else {
            showMessage('adminMessage', 'danger', result.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('adminMessage', 'danger', 'Connection error. Please try again.');
    }
});

// Helper function to show messages
function showMessage(elementId, type, message) {
    const messageDiv = document.getElementById(elementId);
    messageDiv.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}
