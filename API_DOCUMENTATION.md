# FoodHub API Documentation

A comprehensive food delivery backend API built with Express.js, TypeScript, Prisma, and Better Auth.

## Base URL

```
http://localhost:5000/api
```

## Authentication

All authenticated endpoints require a valid session token from Better Auth.

**Headers:**
```
Authorization: Bearer <session_token>
Cookie: better-auth.session_token=<session_token>
```

---

## Health Check

### GET /health
Check API health status.

**Response:**
```json
{
  "success": true,
  "message": "FoodHub API is running",
  "timestamp": "2026-01-31T12:00:00.000Z",
  "environment": "development"
}
```

---

## Authentication (Better Auth)

### POST /api/auth/sign-up/email
Register a new user.

### POST /api/auth/sign-in/email
Sign in with email and password.

### POST /api/auth/sign-out
Sign out current session.

### GET /api/auth/session
Get current session info.

*See Better Auth documentation for complete auth endpoints.*

---

## User Profile

### GET /api/user/profile
Get current user's profile. **[Auth Required]**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "John Doe",
    "image": "https://...",
    "role": "CUSTOMER",
    "emailVerified": true,
    "createdAt": "2026-01-31T...",
    "_count": { "orders": 5, "reviews": 3 }
  }
}
```

### PATCH /api/user/profile
Update current user's profile. **[Auth Required]**

**Body:**
```json
{
  "name": "New Name",
  "image": "https://new-image-url.com"
}
```

### GET /api/user/dashboard
Get user dashboard stats. **[Auth Required]**

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 10,
    "totalSpent": 500.00,
    "totalReviews": 5,
    "recentOrders": [...]
  }
}
```

### GET /api/user/orders
Get user's order history. **[Auth Required]**

---

## Meals (Public)

### GET /api/meals
Get all meals with filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `categoryId` | string | Filter by category |
| `providerId` | string | Filter by provider |
| `search` | string | Search by name/description |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `isAvailable` | boolean | Filter by availability |
| `sort` | string | `price_asc`, `price_desc`, `newest`, `oldest`, `rating`, `popular` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 100) |

**Response:**
```json
{
  "success": true,
  "data": [{
    "id": "cuid",
    "name": "Meal Name",
    "price": 12.99,
    "avgRating": 4.5,
    "reviewCount": 10,
    "category": {...},
    "providerProfile": {...}
  }],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### GET /api/meals/:id
Get meal details with reviews.

---

## Categories (Public)

### GET /api/categories
Get all categories.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by name/description |
| `page` | number | Page number |
| `limit` | number | Items per page |

### GET /api/categories/:id
Get category by ID.

---

## Providers (Public)

### GET /api/providers
Get all active providers.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by business name |
| `cuisineType` | string | Filter by cuisine type |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response includes:** `avgRating`, `totalReviews`, meal/order counts.

### GET /api/providers/:id
Get provider details with menu.

---

## Orders (Customer)

### POST /api/orders
Create a new order. **[Auth Required]**

**Body:**
```json
{
  "providerProfileId": "cuid",
  "deliveryAddress": "123 Main St",
  "deliveryNotes": "Ring doorbell",
  "items": [
    { "mealId": "cuid", "quantity": 2 }
  ]
}
```

### GET /api/orders
Get customer's orders. **[Auth Required]**

### GET /api/orders/:id
Get order details. **[Auth Required]**

### PATCH /api/orders/:id/cancel
Cancel an order (only if PENDING). **[Auth Required]**

---

## Reviews

### POST /api/reviews
Create a review for an ordered meal. **[Auth Required]**

**Body:**
```json
{
  "mealId": "cuid",
  "orderId": "cuid",
  "rating": 5,
  "comment": "Delicious!"
}
```

### GET /api/meals/:mealId/reviews
Get reviews for a meal. **[Public]**

### GET /api/reviews/me
Get current user's reviews. **[Auth Required]**

### PUT /api/reviews/:id
Update own review. **[Auth Required]**

### DELETE /api/reviews/:id
Delete own review. **[Auth Required]**

---

## Provider Dashboard

### GET /api/provider/profile
Get provider profile. **[Provider Auth]**

### POST /api/provider/profile
Create provider profile. **[Auth Required]**

### PUT /api/provider/profile
Update provider profile. **[Provider Auth]**

### GET /api/provider/meals
Get provider's meals. **[Provider Auth]**

### POST /api/provider/meals
Create a new meal. **[Provider Auth]**

### PUT /api/provider/meals/:id
Update a meal. **[Provider Auth]**

### DELETE /api/provider/meals/:id
Delete a meal. **[Provider Auth]**

### GET /api/provider/orders
Get provider's orders. **[Provider Auth]**

### PATCH /api/provider/orders/:id/status
Update order status. **[Provider Auth]**

**Body:**
```json
{
  "status": "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED"
}
```

---

## Admin Dashboard

### GET /api/admin/dashboard
Get admin dashboard stats. **[Admin Auth]**

### GET /api/admin/users
Get all users with filters. **[Admin Auth]**

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | string | `CUSTOMER`, `PROVIDER`, `ADMIN` |
| `search` | string | Search by name/email |
| `banned` | boolean | Filter by ban status |
| `page` | number | Page number |
| `limit` | number | Items per page |

### GET /api/admin/users/:id
Get user details. **[Admin Auth]**

### PATCH /api/admin/users/:id/ban
Ban or unban a user. **[Admin Auth]**

**Body:**
```json
{
  "banned": true,
  "banReason": "Violation of terms"
}
```

### GET /api/admin/orders
Get all orders system-wide. **[Admin Auth]**

### POST /api/admin/categories
Create a category. **[Admin Auth]**

### PUT /api/admin/categories/:id
Update a category. **[Admin Auth]**

### DELETE /api/admin/categories/:id
Delete a category (only if no meals). **[Admin Auth]**

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // validation errors if applicable
}
```

**Common Status Codes:**
| Code | Description |
|------|-------------|
| 400 | Bad Request / Validation Error |
| 401 | Authentication Required |
| 403 | Forbidden (insufficient permissions) |
| 404 | Resource Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

---

## User Roles

| Role | Capabilities |
|------|-------------|
| `CUSTOMER` | Browse, order, review meals |
| `PROVIDER` | All customer abilities + manage meals/orders |
| `ADMIN` | All abilities + manage users/categories |

---

## Pagination

All list endpoints support pagination:

```json
{
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```
