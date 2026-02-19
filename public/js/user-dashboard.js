/**
 * User Dashboard JavaScript
 * Handles user dashboard functionality
 */

const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

// Check authentication
if (!token) {
    window.location.href = '/';
}

// Set user name
document.getElementById('userName').textContent = localStorage.getItem('userName') || 'User';

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = '/';
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });

    // Remove active class from all menu items
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName + 'Section').style.display = 'block';

    // Add active class to clicked menu item
    event.target.classList.add('active');

    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'qrcode':
            loadQRCode();
            break;
        case 'consumption':
            loadConsumption();
            break;
        case 'transactions':
            loadTransactions();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// Load Dashboard
async function loadDashboard() {
    try {
        // Load stats
        const statsResponse = await fetch(`${API_URL}/users/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsResponse.json();

        if (statsData.success) {
            document.getElementById('totalTransactions').textContent = statsData.data.totalTransactions;
            document.getElementById('approvedCount').textContent = statsData.data.approvedTransactions;
            document.getElementById('rejectedCount').textContent = statsData.data.rejectedTransactions;
        }

        // Load consumption
        const consumptionResponse = await fetch(`${API_URL}/users/consumption`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const consumptionData = await consumptionResponse.json();

        if (consumptionData.success) {
            const { consumedToday, dailyLimit, remaining, percentageUsed } = consumptionData.data;
            
            document.getElementById('todayConsumption').textContent = consumedToday.toFixed(2) + 'g';
            document.getElementById('consumedAmount').textContent = consumedToday.toFixed(2) + 'g';
            document.getElementById('dailyLimit').textContent = dailyLimit + 'g';
            document.getElementById('remainingAmount').textContent = remaining.toFixed(2) + 'g';
            
            const progressBar = document.getElementById('consumptionProgress');
            progressBar.style.width = percentageUsed + '%';
            progressBar.textContent = percentageUsed + '%';
            
            if (percentageUsed >= 90) {
                progressBar.className = 'progress-bar bg-danger';
            } else if (percentageUsed >= 70) {
                progressBar.className = 'progress-bar bg-warning';
            } else {
                progressBar.className = 'progress-bar bg-success';
            }
        }

        // Load recent transactions
        const transResponse = await fetch(`${API_URL}/users/transactions?limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const transData = await transResponse.json();

        if (transData.success && transData.data.length > 0) {
            const tableHtml = `
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Liquor</th>
                            <th>Volume</th>
                            <th>Pure Alcohol</th>
                            <th>Vendor</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transData.data.map(t => `
                            <tr>
                                <td>${new Date(t.timestamp).toLocaleString()}</td>
                                <td>${t.liquorType.name}</td>
                                <td>${t.volumeMl}ml</td>
                                <td>${t.pureAlcoholGrams.toFixed(2)}g</td>
                                <td>${t.vendor.shopName}</td>
                                <td><span class="badge bg-${t.status === 'approved' ? 'success' : 'danger'}">${t.status.toUpperCase()}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            document.getElementById('recentTransactions').innerHTML = tableHtml;
        } else {
            document.getElementById('recentTransactions').innerHTML = '<p class="text-center text-muted">No transactions yet</p>';
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load QR Code
async function loadQRCode() {
    try {
        const response = await fetch(`${API_URL}/users/qrcode`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById('displayUserId').textContent = data.data.userId;
            document.getElementById('qrCodeDisplay').innerHTML = `
                <img src="${data.data.qrCode}" alt="QR Code" class="img-fluid" style="max-width: 300px;">
            `;
        }
    } catch (error) {
        console.error('Error loading QR code:', error);
        document.getElementById('qrCodeDisplay').innerHTML = '<p class="text-danger">Error loading QR code</p>';
    }
}

// Download QR Code
function downloadQRCode() {
    const qrImage = document.querySelector('#qrCodeDisplay img');
    if (qrImage) {
        const link = document.createElement('a');
        link.download = 'my-qrcode.png';
        link.href = qrImage.src;
        link.click();
    }
}

// Load Consumption Details
async function loadConsumption() {
    try {
        const response = await fetch(`${API_URL}/users/consumption`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            const { consumedToday, dailyLimit, remaining, percentageUsed, lastResetDate } = data.data;
            
            document.getElementById('consumptionToday').textContent = consumedToday.toFixed(2) + 'g';
            document.getElementById('consumptionLimit').textContent = dailyLimit + 'g';
            document.getElementById('consumptionRemaining').textContent = remaining.toFixed(2) + 'g';
            document.getElementById('consumptionPercent').textContent = percentageUsed + '%';
            document.getElementById('lastReset').textContent = new Date(lastResetDate).toLocaleString();
        }
    } catch (error) {
        console.error('Error loading consumption:', error);
    }
}

// Load Transactions
async function loadTransactions() {
    try {
        const response = await fetch(`${API_URL}/users/transactions?limit=50`, {
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
                            <th>Liquor Type</th>
                            <th>Category</th>
                            <th>Volume</th>
                            <th>Alcohol %</th>
                            <th>Pure Alcohol</th>
                            <th>Vendor</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.data.map((t, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td>${new Date(t.timestamp).toLocaleString()}</td>
                                <td>${t.liquorType.name}</td>
                                <td><span class="badge bg-secondary">${t.liquorType.category}</span></td>
                                <td>${t.volumeMl}ml</td>
                                <td>${t.alcoholPercentage}%</td>
                                <td><strong>${t.pureAlcoholGrams.toFixed(2)}g</strong></td>
                                <td>${t.vendor.shopName}</td>
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
        document.getElementById('transactionsList').innerHTML = '<p class="text-center text-danger">Error loading transactions</p>';
    }
}

// Load Profile
async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            const user = data.data;
            document.getElementById('profileName').textContent = user.name;
            document.getElementById('profileEmail').textContent = user.email;
            document.getElementById('profileUserId').textContent = user.userId;
            document.getElementById('profileCreatedAt').textContent = new Date(user.createdAt).toLocaleDateString();
            
            if (user.isActive) {
                document.getElementById('profileStatus').className = 'badge bg-success';
                document.getElementById('profileStatus').textContent = 'Active';
            } else {
                document.getElementById('profileStatus').className = 'badge bg-danger';
                document.getElementById('profileStatus').textContent = 'Inactive';
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Load dashboard on page load
loadDashboard();
