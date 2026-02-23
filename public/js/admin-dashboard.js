/**
 * Admin Dashboard JavaScript
 * Handles admin dashboard functionality
 */

const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

// Check authentication
if (!token) {
    window.location.href = '/';
}

// Set admin name
document.getElementById('adminName').textContent = localStorage.getItem('adminName') || 'Admin';

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = '/';
}

// Show section
function showSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });

    document.getElementById(sectionName + 'Section').style.display = 'block';
    event.target.classList.add('active');

    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'users':
            loadUsers();
            break;
        case 'vendors':
            loadVendors();
            break;
        case 'liquor':
            loadLiquorTypes();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Load Dashboard
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/admin/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            const { overview, today, recentTransactions } = data.data;

            document.getElementById('totalUsers').textContent = overview.totalUsers;
            document.getElementById('totalVendors').textContent = overview.totalVendors;
            document.getElementById('totalTransactions').textContent = overview.totalTransactions;
            document.getElementById('totalLiquorTypes').textContent = overview.totalLiquorTypes;

            document.getElementById('todayTransactions').textContent = today.transactions;
            document.getElementById('todayApproved').textContent = today.approved;
            document.getElementById('todayRejected').textContent = today.rejected;
            document.getElementById('todaySales').textContent = (today.sales || 0).toFixed(2);

            const approvalProgress = document.getElementById('approvalProgress');
            approvalProgress.style.width = today.approvalRate + '%';
            document.getElementById('approvalRate').textContent = today.approvalRate + '% Approval Rate';

            if (recentTransactions.length > 0) {
                const tableHtml = `
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>User</th>
                                <th>Vendor</th>
                                <th>Liquor</th>
                                <th>Volume</th>
                                <th>Pure Alcohol</th>
                                <th>Price</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${recentTransactions.map(t => `
                                <tr>
                                    <td>${new Date(t.timestamp).toLocaleString()}</td>
                                    <td>${t.user.name}<br><small class="text-muted">${t.user.userId}</small></td>
                                    <td>${t.vendor.shopName}</td>
                                    <td>${t.liquorType.name}</td>
                                    <td>${t.volumeMl}ml</td>
                                    <td>${t.pureAlcoholGrams.toFixed(2)}g</td>
                                    <td><strong>₹${(t.totalPrice || 0).toFixed(2)}</strong></td>
                                    <td><span class="badge bg-${t.status === 'approved' ? 'success' : 'danger'}">${t.status.toUpperCase()}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                document.getElementById('recentTransactions').innerHTML = tableHtml;
            } else {
                document.getElementById('recentTransactions').innerHTML = '<p class="text-center text-muted">No recent transactions</p>';
            }
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load Users
async function loadUsers(search = '') {
    try {
        let url = `${API_URL}/admin/users?limit=100`;
        if (search) url += `&search=${search}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const tableHtml = `
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Consumed Today</th>
                            <th>Registered</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map((u, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><span class="badge bg-primary">${u.userId}</span></td>
                                <td>${u.name}</td>
                                <td>${u.email}</td>
                                <td>${u.consumedToday.toFixed(2)}g</td>
                                <td>${new Date(u.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <span class="badge bg-${u.isActive ? 'success' : 'danger'}">
                                        ${u.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-${u.isActive ? 'warning' : 'success'}" onclick="toggleUserStatus('${u._id}', ${u.isActive})">
                                        ${u.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('usersList').innerHTML = tableHtml;
        } else {
            document.getElementById('usersList').innerHTML = '<p class="text-center text-muted">No users found</p>';
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Search Users
function searchUsers() {
    const search = document.getElementById('userSearch').value;
    loadUsers(search);
}

// Toggle User Status
async function toggleUserStatus(userId, currentStatus) {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            alert(data.message);
            loadUsers();
        } else {
            alert(data.message || 'Failed to update user status');
        }
    } catch (error) {
        console.error('Error toggling user status:', error);
        alert('Error updating user status');
    }
}

// Load Vendors
async function loadVendors(search = '') {
    try {
        let url = `${API_URL}/admin/vendors?limit=100`;
        if (search) url += `&search=${search}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const tableHtml = `
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Shop Name</th>
                            <th>Owner</th>
                            <th>Email</th>
                            <th>License</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map((v, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${v.shopName}</strong></td>
                                <td>${v.name}</td>
                                <td>${v.email}</td>
                                <td>${v.licenseNumber}</td>
                                <td>${v.phone}</td>
                                <td>
                                    <span class="badge bg-${v.isActive ? 'success' : 'danger'}">
                                        ${v.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-${v.isActive ? 'warning' : 'success'}" onclick="toggleVendorStatus('${v._id}', ${v.isActive})">
                                        ${v.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('vendorsList').innerHTML = tableHtml;
        } else {
            document.getElementById('vendorsList').innerHTML = '<p class="text-center text-muted">No vendors found</p>';
        }
    } catch (error) {
        console.error('Error loading vendors:', error);
    }
}

// Search Vendors
function searchVendors() {
    const search = document.getElementById('vendorSearch').value;
    loadVendors(search);
}

// Toggle Vendor Status
async function toggleVendorStatus(vendorId, currentStatus) {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this vendor?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/vendors/${vendorId}/toggle-status`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            alert(data.message);
            loadVendors();
        } else {
            alert(data.message || 'Failed to update vendor status');
        }
    } catch (error) {
        console.error('Error toggling vendor status:', error);
        alert('Error updating vendor status');
    }
}

// Load Liquor Types
async function loadLiquorTypes() {
    try {
        const response = await fetch(`${API_URL}/admin/liquor-types`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const tableHtml = `
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Alcohol %</th>
                            <th>Price/Unit</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map((l, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${l.name}</strong></td>
                                <td><span class="badge bg-secondary">${l.category}</span></td>
                                <td>${l.alcoholPercentage}%</td>
                                <td>₹${l.pricePerUnit ? l.pricePerUnit.toFixed(2) : '0.00'}/${l.unit || 'ml'}</td>
                                <td>${l.description || '-'}</td>
                                <td>
                                    <span class="badge bg-${l.isActive ? 'success' : 'danger'}">
                                        ${l.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-primary" onclick="editLiquor('${l._id}')">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteLiquor('${l._id}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('liquorList').innerHTML = tableHtml;
        } else {
            document.getElementById('liquorList').innerHTML = '<p class="text-center text-muted">No liquor types found</p>';
        }
    } catch (error) {
        console.error('Error loading liquor types:', error);
    }
}

// Add Liquor Type
document.getElementById('addLiquorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        alcoholPercentage: parseFloat(formData.get('alcoholPercentage')),
        category: formData.get('category'),
        description: formData.get('description'),
        pricePerUnit: parseFloat(formData.get('pricePerUnit')) || 0,
        unit: formData.get('unit') || 'ml'
    };

    try {
        const response = await fetch(`${API_URL}/admin/liquor-types`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.success) {
            document.getElementById('liquorMessage').innerHTML = '<div class="alert alert-success">Liquor type added successfully!</div>';
            e.target.reset();
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('addLiquorModal')).hide();
                loadLiquorTypes();
            }, 1500);
        } else {
            document.getElementById('liquorMessage').innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        console.error('Error adding liquor type:', error);
        document.getElementById('liquorMessage').innerHTML = '<div class="alert alert-danger">Error adding liquor type</div>';
    }
});

// Edit Liquor
async function editLiquor(id) {
    try {
        const response = await fetch(`${API_URL}/admin/liquor-types`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            const liquor = data.data.find(l => l._id === id);
            if (liquor) {
                document.getElementById('editLiquorId').value = liquor._id;
                document.getElementById('editName').value = liquor.name;
                document.getElementById('editAlcoholPercentage').value = liquor.alcoholPercentage;
                document.getElementById('editCategory').value = liquor.category;
                document.getElementById('editDescription').value = liquor.description || '';
                document.getElementById('editPricePerUnit').value = liquor.pricePerUnit || 0;
                document.getElementById('editUnit').value = liquor.unit || 'ml';
                document.getElementById('editIsActive').checked = liquor.isActive;

                const modal = new bootstrap.Modal(document.getElementById('editLiquorModal'));
                modal.show();
            }
        }
    } catch (error) {
        console.error('Error fetching liquor details:', error);
    }
}

// Update Liquor
document.getElementById('editLiquorForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editLiquorId').value;
    const data = {
        name: document.getElementById('editName').value,
        alcoholPercentage: parseFloat(document.getElementById('editAlcoholPercentage').value),
        category: document.getElementById('editCategory').value,
        description: document.getElementById('editDescription').value,
        pricePerUnit: parseFloat(document.getElementById('editPricePerUnit').value) || 0,
        unit: document.getElementById('editUnit').value || 'ml',
        isActive: document.getElementById('editIsActive').checked
    };

    try {
        const response = await fetch(`${API_URL}/admin/liquor-types/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.success) {
            document.getElementById('editLiquorMessage').innerHTML = '<div class="alert alert-success">Updated successfully!</div>';
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.getElementById('editLiquorModal')).hide();
                loadLiquorTypes();
            }, 1500);
        } else {
            document.getElementById('editLiquorMessage').innerHTML = `<div class="alert alert-danger">${result.message}</div>`;
        }
    } catch (error) {
        console.error('Error updating liquor type:', error);
        document.getElementById('editLiquorMessage').innerHTML = '<div class="alert alert-danger">Error updating liquor type</div>';
    }
});

// Delete Liquor
async function deleteLiquor(id) {
    if (!confirm('Are you sure you want to delete this liquor type?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/liquor-types/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            alert('Liquor type deleted successfully');
            loadLiquorTypes();
        } else {
            alert(data.message || 'Failed to delete liquor type');
        }
    } catch (error) {
        console.error('Error deleting liquor type:', error);
        alert('Error deleting liquor type');
    }
}

// Load Transactions
async function loadTransactions() {
    try {
        const status = document.getElementById('statusFilter').value;
        const userId = document.getElementById('userIdFilter').value;

        let url = `${API_URL}/admin/transactions?limit=100`;
        if (status) url += `&status=${status}`;
        if (userId) url += `&userId=${userId}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            const tableHtml = `
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Date & Time</th>
                            <th>User</th>
                            <th>Vendor</th>
                            <th>Liquor</th>
                            <th>Volume</th>
                            <th>Pure Alcohol</th>
                            <th>Price</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map((t, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${new Date(t.timestamp).toLocaleString()}</td>
                                <td>${t.user.name}<br><small class="text-muted">${t.user.userId}</small></td>
                                <td>${t.vendor.shopName}</td>
                                <td>${t.liquorType.name}<br><small class="text-muted">${t.alcoholPercentage}%</small></td>
                                <td>${t.volumeMl}ml</td>
                                <td><strong>${t.pureAlcoholGrams.toFixed(2)}g</strong></td>
                                <td><strong class="text-warning">₹${(t.totalPrice || 0).toFixed(2)}</strong></td>
                                <td>
                                    <span class="badge bg-${t.status === 'approved' ? 'success' : 'danger'}">
                                        ${t.status.toUpperCase()}
                                    </span>
                                    ${t.rejectionReason ? `<br><small class="text-muted">${t.rejectionReason}</small>` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('transactionsList').innerHTML = tableHtml;
        } else {
            document.getElementById('transactionsList').innerHTML = '<p class="text-center text-muted">No transactions found</p>';
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

// Load Settings
async function loadSettings() {
    try {
        const response = await fetch(`${API_URL}/admin/config/daily-limit`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById('dailyLimitInput').value = data.data.dailyLimit;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Update Daily Limit
document.getElementById('limitForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dailyLimit = parseFloat(document.getElementById('dailyLimitInput').value);

    try {
        const response = await fetch(`${API_URL}/admin/config/daily-limit`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dailyLimit })
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById('limitMessage').innerHTML = '<div class="alert alert-success">Daily limit updated successfully!</div>';
            setTimeout(() => {
                document.getElementById('limitMessage').innerHTML = '';
            }, 3000);
        } else {
            document.getElementById('limitMessage').innerHTML = `<div class="alert alert-danger">${data.message}</div>`;
        }
    } catch (error) {
        console.error('Error updating daily limit:', error);
        document.getElementById('limitMessage').innerHTML = '<div class="alert alert-danger">Error updating daily limit</div>';
    }
});

// Load dashboard on page load
loadDashboard();
