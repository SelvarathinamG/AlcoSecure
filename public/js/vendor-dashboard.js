/**
 * Vendor Dashboard JavaScript
 * Handles vendor dashboard functionality and QR scanning
 */

const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

// Check authentication
if (!token) {
    window.location.href = '/';
}

// Set shop name
document.getElementById('shopName').textContent = localStorage.getItem('shopName') || 'Vendor';

let html5QrCode = null;
let scannedUserData = null;
let liquorTypes = [];

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
        case 'scanner':
            loadLiquorTypes();
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
        const statsResponse = await fetch(`${API_URL}/vendors/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const statsData = await statsResponse.json();

        if (statsData.success) {
            document.getElementById('totalTransactions').textContent = statsData.data.totalTransactions;
            document.getElementById('approvedCount').textContent = statsData.data.approvedTransactions;
            document.getElementById('rejectedCount').textContent = statsData.data.rejectedTransactions;
            document.getElementById('todayCount').textContent = statsData.data.todayTransactions;
            document.getElementById('todaySales').textContent = (statsData.data.todaySales || 0).toFixed(2);
        }

        const transResponse = await fetch(`${API_URL}/vendors/transactions?limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const transData = await transResponse.json();

        if (transData.success && transData.data.length > 0) {
            const tableHtml = `
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>User</th>
                            <th>Liquor</th>
                            <th>Volume</th>
                            <th>Pure Alcohol</th>
                            <th>Price</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transData.data.map(t => `
                            <tr>
                                <td>${new Date(t.timestamp).toLocaleString()}</td>
                                <td>${t.user.name} (${t.user.userId})</td>
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
            document.getElementById('recentTransactions').innerHTML = '<p class="text-center text-muted">No transactions yet</p>';
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load Liquor Types
async function loadLiquorTypes() {
    try {
        const response = await fetch(`${API_URL}/vendors/liquor-types`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            liquorTypes = data.data;
            const select = document.getElementById('liquorType');
            select.innerHTML = '<option value="">Select liquor type...</option>' +
                liquorTypes.map(l => `<option value="${l._id}">${l.name} (${l.alcoholPercentage}%)</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading liquor types:', error);
    }
}

// Start QR Scanner
function startScanner() {
    html5QrCode = new Html5Qrcode("qrReader");
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanError
    ).then(() => {
        document.getElementById('startScanBtn').style.display = 'none';
        document.getElementById('stopScanBtn').style.display = 'inline-block';
    }).catch(err => {
        console.error('Error starting scanner:', err);
        alert('Unable to start camera. Please check permissions or use manual entry.');
    });
}

// Stop QR Scanner
function stopScanner() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            document.getElementById('startScanBtn').style.display = 'inline-block';
            document.getElementById('stopScanBtn').style.display = 'none';
        }).catch(err => {
            console.error('Error stopping scanner:', err);
        });
    }
}

// On QR Scan Success
async function onScanSuccess(decodedText) {
    stopScanner();
    await lookupUser(decodedText);
}

// On QR Scan Error (silent)
function onScanError(errorMessage) {
    // Silent - normal scanning errors
}

// Manual Scan
async function manualScan() {
    const userId = document.getElementById('manualUserId').value.trim();
    if (!userId) {
        alert('Please enter a User ID');
        return;
    }
    await lookupUser(userId);
}

// Lookup User
async function lookupUser(userId) {
    try {
        const response = await fetch(`${API_URL}/vendors/scan`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        const data = await response.json();

        if (data.success) {
            scannedUserData = data.data;
            
            document.getElementById('scannedUserId').textContent = scannedUserData.userId;
            document.getElementById('scannedUserName').textContent = scannedUserData.name;
            document.getElementById('userConsumed').textContent = scannedUserData.consumedToday.toFixed(2) + 'g';
            document.getElementById('userLimit').textContent = scannedUserData.dailyLimit + 'g';
            document.getElementById('userRemaining').textContent = scannedUserData.remaining.toFixed(2) + 'g';
            document.getElementById('userSpent').textContent = '₹' + (scannedUserData.totalSpentToday || 0).toFixed(2);
            
            if (scannedUserData.remaining <= 0) {
                document.getElementById('userRemaining').className = 'text-danger';
            } else if (scannedUserData.remaining < scannedUserData.dailyLimit * 0.2) {
                document.getElementById('userRemaining').className = 'text-warning';
            } else {
                document.getElementById('userRemaining').className = 'text-success';
            }
            
            document.getElementById('userInfoCard').style.display = 'block';
            document.getElementById('purchaseFormCard').style.display = 'block';
            document.getElementById('purchaseUserId').value = scannedUserData.userId;
            
            document.getElementById('purchaseResult').style.display = 'none';
        } else {
            alert(data.message || 'User not found');
        }
    } catch (error) {
        console.error('Error looking up user:', error);
        alert('Error looking up user. Please try again.');
    }
}

// Calculate pure alcohol on volume/liquor change
document.getElementById('volumeMl').addEventListener('input', updateAlcoholCalculation);
document.getElementById('liquorType').addEventListener('change', updateAlcoholCalculation);

function updateAlcoholCalculation() {
    const volume = parseFloat(document.getElementById('volumeMl').value);
    const liquorId = document.getElementById('liquorType').value;
    
    if (volume && liquorId) {
        const liquor = liquorTypes.find(l => l._id === liquorId);
        if (liquor) {
            const pureAlcohol = (volume * (liquor.alcoholPercentage / 100) * 0.789).toFixed(2);
            const totalPrice = (volume * (liquor.pricePerUnit || 0)).toFixed(2);
            document.getElementById('calculationDisplay').style.display = 'block';
            document.getElementById('pureAlcoholCalc').textContent = pureAlcohol + 'g';
            document.getElementById('totalPriceCalc').textContent = totalPrice;
        }
    } else {
        document.getElementById('calculationDisplay').style.display = 'none';
    }
}

// Process Purchase
document.getElementById('purchaseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('purchaseUserId').value;
    const liquorTypeId = document.getElementById('liquorType').value;
    const volumeMl = parseFloat(document.getElementById('volumeMl').value);
    
    if (!userId || !liquorTypeId || !volumeMl) {
        alert('Please fill all required fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/vendors/purchase`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, liquorTypeId, volumeMl })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const { status, message, details, transaction } = data.data;
            
            const resultHtml = `
                <div class="card">
                    <div class="card-header bg-${status === 'approved' ? 'success' : 'danger'} text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-${status === 'approved' ? 'check-circle' : 'times-circle'}"></i>
                            Purchase ${status.toUpperCase()}
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-${status === 'approved' ? 'success' : 'danger'}">
                            <strong>${message}</strong>
                        </div>
                        <table class="table table-sm">
                            <tr>
                                <th>User:</th>
                                <td>${transaction.user.name} (${transaction.user.userId})</td>
                            </tr>
                            <tr>
                                <th>Liquor:</th>
                                <td>${transaction.liquorType.name} (${details.alcoholPercentage}%)</td>
                            </tr>
                            <tr>
                                <th>Volume:</th>
                                <td>${details.volumeMl}ml</td>
                            </tr>
                            <tr>
                                <th>Pure Alcohol:</th>
                                <td><strong>${details.pureAlcoholGrams.toFixed(2)}g</strong></td>
                            </tr>
                            <tr>
                                <th>Price:</th>
                                <td><strong class="text-warning">₹${details.totalPrice}</strong> (₹${details.pricePerUnit}/ml)</td>
                            </tr>
                            <tr>
                                <th>Previous Consumption:</th>
                                <td>${details.previousConsumption.toFixed(2)}g</td>
                            </tr>
                            <tr>
                                <th>New Total:</th>
                                <td>${details.newTotalConsumption.toFixed(2)}g</td>
                            </tr>
                            <tr>
                                <th>Daily Limit:</th>
                                <td>${details.dailyLimit}g</td>
                            </tr>
                            <tr>
                                <th>Total Spent Today:</th>
                                <td class="text-warning"><strong>₹${details.totalSpentToday.toFixed(2)}</strong></td>
                            </tr>
                            <tr>
                                <th>Remaining:</th>
                                <td class="text-${status === 'approved' ? 'success' : 'danger'}">
                                    <strong>${details.remaining.toFixed(2)}g</strong>
                                </td>
                            </tr>
                        </table>
                        <button class="btn btn-primary" onclick="resetScanForm()">
                            <i class="fas fa-redo"></i> New Transaction
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('purchaseResult').innerHTML = resultHtml;
            document.getElementById('purchaseResult').style.display = 'block';
            
            // Hide form after successful submission
            document.getElementById('userInfoCard').style.display = 'none';
            document.getElementById('purchaseFormCard').style.display = 'none';
            
        } else {
            alert(data.message || 'Purchase processing failed');
        }
    } catch (error) {
        console.error('Error processing purchase:', error);
        alert('Error processing purchase. Please try again.');
    }
});

// Reset scan form
function resetScanForm() {
    document.getElementById('purchaseForm').reset();
    document.getElementById('manualUserId').value = '';
    document.getElementById('userInfoCard').style.display = 'none';
    document.getElementById('purchaseFormCard').style.display = 'none';
    document.getElementById('purchaseResult').style.display = 'none';
    document.getElementById('calculationDisplay').style.display = 'none';
    scannedUserData = null;
}

// Load Transactions
async function loadTransactions() {
    try {
        const status = document.getElementById('statusFilter').value;
        let url = `${API_URL}/vendors/transactions?limit=100`;
        if (status) url += `&status=${status}`;
        
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
                                <td>${t.liquorType.name}<br><small class="text-muted">${t.alcoholPercentage}%</small></td>
                                <td>${t.volumeMl}ml</td>
                                <td><strong>${t.pureAlcoholGrams.toFixed(2)}g</strong></td>
                                <td><strong class="text-warning">₹${(t.totalPrice || 0).toFixed(2)}</strong></td>
                                <td>
                                    <span class="badge bg-${t.status === 'approved' ? 'success' : 'danger'}">
                                        ${t.status.toUpperCase()}
                                    </span>
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

// Load Profile
async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/vendors/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const vendor = data.data;
            document.getElementById('profileShopName').textContent = vendor.shopName;
            document.getElementById('profileName').textContent = vendor.name;
            document.getElementById('profileEmail').textContent = vendor.email;
            document.getElementById('profileLicense').textContent = vendor.licenseNumber;
            document.getElementById('profilePhone').textContent = vendor.phone;
            document.getElementById('profileAddress').textContent = vendor.address;
            
            if (vendor.isActive) {
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
