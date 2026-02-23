# API Documentation - AlcoSecure

Complete API reference for the AlcoSecure QR-Based Alcohol Monitoring System.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] // Optional validation errors
}
```

---

## Authentication Endpoints

### 1. User Registration

**POST** `/auth/user/register`

Register a new user and receive QR code.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "aadhaar": "123456789012"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "userId": "ETH123456"
  }
}
```

**Validation:**
- `name`: 2-100 characters
- `email`: Valid email format
- `password`: Minimum 6 characters
- `aadhaar`: Exactly 12 digits

---

### 2. User Login

**POST** `/auth/user/login`

Authenticate existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "userId": "ETH123456"
  }
}
```

---

### 3. Vendor Registration

**POST** `/auth/vendor/register`

Register a new vendor.

**Request Body:**
```json
{
  "name": "Vendor Name",
  "email": "vendor@example.com",
  "password": "password123",
  "shopName": "ABC Liquor Store",
  "licenseNumber": "LIC123456",
  "address": "123 Main Street, City",
  "phone": "1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "name": "Vendor Name",
    "email": "vendor@example.com",
    "role": "vendor",
    "shopName": "ABC Liquor Store"
  }
}
```

---

### 4. Vendor Login

**POST** `/auth/vendor/login`

Authenticate existing vendor.

**Request Body:**
```json
{
  "email": "vendor@example.com",
  "password": "password123"
}
```

---

### 5. Admin Login

**POST** `/auth/admin/login`

Authenticate admin user.

**Request Body:**
```json
{
  "email": "admin@alcosecure.com",
  "password": "admin123"
}
```

---

## User Endpoints

### 6. Get User Profile

**GET** `/users/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com",
    "userId": "ETH123456",
    "role": "user",
    "consumedToday": 15.5,
    "lastResetDate": "2026-02-19T10:30:00.000Z",
    "isActive": true,
    "createdAt": "2026-02-01T08:00:00.000Z"
  }
}
```

---

### 7. Get QR Code

**GET** `/users/qrcode`

Get user's QR code image.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "ETH123456",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

---

### 8. Get Consumption Status

**GET** `/users/consumption`

Get current consumption and limit information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "consumedToday": 25.5,
    "dailyLimit": 60,
    "remaining": 34.5,
    "lastResetDate": "2026-02-19T00:00:00.000Z",
    "percentageUsed": "42.50"
  }
}
```

---

### 9. Get Transaction History

**GET** `/users/transactions`

Get user's transaction history.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
      "user": "64f5a1b2c3d4e5f6g7h8i9j0",
      "vendor": {
        "_id": "64f5a1b2c3d4e5f6g7h8i9j1",
        "shopName": "ABC Liquor Store"
      },
      "liquorType": {
        "_id": "64f5a1b2c3d4e5f6g7h8i9j2",
        "name": "Kingfisher Beer",
        "alcoholPercentage": 5,
        "category": "Beer"
      },
      "volumeMl": 330,
      "pureAlcoholGrams": 13.02,
      "status": "approved",
      "timestamp": "2026-02-19T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### 10. Get User Statistics

**GET** `/users/stats`

Get user's statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 45,
    "approvedTransactions": 38,
    "rejectedTransactions": 7,
    "todayTransactions": 3,
    "consumedToday": 25.5,
    "recentTransactions": [ ... ]
  }
}
```

---

## Vendor Endpoints

### 11. Get Vendor Profile

**GET** `/vendors/profile`

Get vendor profile information.

---

### 12. Scan User QR Code

**POST** `/vendors/scan`

Lookup user by scanning QR code or entering User ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "ETH123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "ETH123456",
    "name": "John Doe",
    "email": "john@example.com",
    "consumedToday": 25.5,
    "dailyLimit": 60,
    "remaining": 34.5,
    "lastResetDate": "2026-02-19T00:00:00.000Z"
  }
}
```

---

### 13. Process Purchase

**POST** `/vendors/purchase`

Process alcohol purchase transaction.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "userId": "ETH123456",
  "liquorTypeId": "64f5a1b2c3d4e5f6g7h8i9j2",
  "volumeMl": 330
}
```

**Response (200) - Approved:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j3",
      "user": {
        "_id": "64f5a1b2c3d4e5f6g7h8i9j0",
        "name": "John Doe",
        "userId": "ETH123456"
      },
      "vendor": "64f5a1b2c3d4e5f6g7h8i9j1",
      "liquorType": {
        "_id": "64f5a1b2c3d4e5f6g7h8i9j2",
        "name": "Kingfisher Beer",
        "category": "Beer"
      },
      "volumeMl": 330,
      "alcoholPercentage": 5,
      "pureAlcoholGrams": 13.02,
      "status": "approved",
      "timestamp": "2026-02-19T15:30:00.000Z"
    },
    "status": "approved",
    "message": "Purchase approved successfully",
    "details": {
      "volumeMl": 330,
      "alcoholPercentage": 5,
      "pureAlcoholGrams": 13.02,
      "previousConsumption": 25.5,
      "newTotalConsumption": 38.52,
      "dailyLimit": 60,
      "remaining": 21.48
    }
  }
}
```

**Response (200) - Rejected:**
```json
{
  "success": true,
  "data": {
    "transaction": { ... },
    "status": "rejected",
    "message": "Purchase would exceed daily limit...",
    "details": {
      "volumeMl": 330,
      "alcoholPercentage": 40,
      "pureAlcoholGrams": 104.28,
      "previousConsumption": 55.5,
      "newTotalConsumption": 55.5,
      "dailyLimit": 60,
      "remaining": 4.5
    }
  }
}
```

---

### 14. Get Liquor Types

**GET** `/vendors/liquor-types`

Get all active liquor types.

**Response (200):**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "_id": "64f5a1b2c3d4e5f6g7h8i9j2",
      "name": "Kingfisher Beer",
      "alcoholPercentage": 5,
      "category": "Beer",
      "description": "Premium lager beer",
      "isActive": true
    }
  ]
}
```

---

### 15. Get Vendor Transactions

**GET** `/vendors/transactions`

Get vendor's transaction history.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (approved/rejected)

---

### 16. Get Vendor Statistics

**GET** `/vendors/stats`

Get vendor's statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 150,
    "approvedTransactions": 130,
    "rejectedTransactions": 20,
    "todayTransactions": 15,
    "approvalRate": "86.67"
  }
}
```

---

## Admin Endpoints

### 17. Get Admin Dashboard

**GET** `/admin/dashboard`

Get comprehensive dashboard statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 245,
      "totalVendors": 18,
      "totalTransactions": 3456,
      "totalLiquorTypes": 12,
      "dailyLimit": 60
    },
    "today": {
      "transactions": 87,
      "approved": 75,
      "rejected": 12,
      "approvalRate": "86.21"
    },
    "recentTransactions": [ ... ]
  }
}
```

---

### 18. Get All Users

**GET** `/admin/users`

Get all registered users.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search by name, email, or userId

**Response (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 245,
    "pages": 13
  }
}
```

---

### 19. Get All Vendors

**GET** `/admin/vendors`

Get all registered vendors.

**Query Parameters:** Same as users

---

### 20. Get All Transactions

**GET** `/admin/transactions`

Get all system transactions.

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `userId` (optional): Filter by specific user

---

### 21. Get Liquor Types

**GET** `/admin/liquor-types`

Get all liquor types (active and inactive).

**Response (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [ ... ]
}
```

---

### 22. Create Liquor Type

**POST** `/admin/liquor-types`

Add new liquor type to the system.

**Request Body:**
```json
{
  "name": "Breezer",
  "alcoholPercentage": 4.8,
  "category": "Other",
  "description": "Fruit flavored alcoholic beverage"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64f5a1b2c3d4e5f6g7h8i9j4",
    "name": "Breezer",
    "alcoholPercentage": 4.8,
    "category": "Other",
    "description": "Fruit flavored alcoholic beverage",
    "isActive": true,
    "createdAt": "2026-02-19T16:00:00.000Z"
  }
}
```

---

### 23. Update Liquor Type

**PUT** `/admin/liquor-types/:id`

Update existing liquor type.

**Request Body:**
```json
{
  "name": "Updated Name",
  "alcoholPercentage": 5.0,
  "category": "Beer",
  "description": "Updated description",
  "isActive": true
}
```

---

### 24. Delete Liquor Type

**DELETE** `/admin/liquor-types/:id`

Delete a liquor type.

**Response (200):**
```json
{
  "success": true,
  "message": "Liquor type deleted successfully"
}
```

---

### 25. Get Daily Limit

**GET** `/admin/config/daily-limit`

Get current daily alcohol limit.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "dailyLimit": 60
  }
}
```

---

### 26. Update Daily Limit

**PUT** `/admin/config/daily-limit`

Update system-wide daily alcohol limit.

**Request Body:**
```json
{
  "dailyLimit": 50
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Daily limit updated successfully",
  "data": {
    "dailyLimit": 50
  }
}
```

---

### 27. Toggle User Status

**PUT** `/admin/users/:id/toggle-status`

Activate or deactivate a user account.

**Response (200):**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "isActive": false
  }
}
```

---

### 28. Toggle Vendor Status

**PUT** `/admin/vendors/:id/toggle-status`

Activate or deactivate a vendor account.

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

## Rate Limiting

Currently no rate limiting is implemented. Consider adding in production.

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response includes:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## Postman Collection

Import this cURL command as a starting point:

```bash
curl -X POST http://localhost:5000/api/auth/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "aadhaar": "123456789012"
  }'
```

---

**Last Updated**: February 19, 2026  
**Version**: 1.0.0
