# API Response Standard

All APIs across the microservices now follow a consistent response format:

```json
{
  "statusCode": 200,
  "message": "success",
  "data": {}
}
```

## Response Structure

- **statusCode**: HTTP status code (200, 201, 400, 401, 403, 404, 409, 429, 500)
- **message**: Descriptive message about the operation
- **data**: The actual response data (can be object, array, or primitive)

## Usage Examples

### Success Response
```json
{
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "123",
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

### Error Response
```json
{
  "statusCode": 404,
  "message": "User not found",
  "data": {}
}
```

### List Response
```json
{
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": {
    "users": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50
    }
  }
}
```

## Implementation

### Using ResponseHandler Class

```typescript
import { ResponseHandler } from './utils/response';

// Success response
ResponseHandler.success(res, { user: userData }, 'User retrieved successfully');

// Error responses
ResponseHandler.notFound(res, 'User not found');
ResponseHandler.badRequest(res, 'Invalid input data');
ResponseHandler.unauthorized(res, 'Access token required');
ResponseHandler.forbidden(res, 'Insufficient permissions');
ResponseHandler.serverError(res, 'Internal server error');

// Created response (201)
ResponseHandler.created(res, { user: newUser }, 'User created successfully');
```

### Available Methods

- `success(res, data, message, statusCode = 200)`
- `error(res, message, statusCode, data = {})`
- `created(res, data, message)` - 201 status
- `notFound(res, message)` - 404 status
- `unauthorized(res, message)` - 401 status
- `forbidden(res, message)` - 403 status
- `conflict(res, message)` - 409 status
- `badRequest(res, message)` - 400 status
- `serverError(res, message)` - 500 status
- `tooManyRequests(res, message)` - 429 status

## Services Updated

✅ **API Gateway** - All authentication and admin routes updated with standardized responses
✅ **Orders/Payments** - All cart, wishlist, order, and payment routes updated with standardized responses
✅ **Product Details** - All book management and search routes updated with standardized responses
✅ **Shipping** - All shipment tracking and delivery routes updated with standardized responses

## Real API Examples

### Authentication (API Gateway)
```json
// POST /auth/login - Success
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}

// POST /auth/login - Error
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "data": {}
}
```

### Cart Operations (Orders/Payments)
```json
// GET /cart - Success
{
  "statusCode": 200,
  "message": "Cart retrieved successfully",
  "data": {
    "cart": [
      {
        "id": "cart-item-1",
        "bookId": "book-123",
        "name": "Clean Code",
        "price": 42.99,
        "quantity": 2
      }
    ],
    "total": 85.98,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Book Search (Product Details)
```json
// GET /books/search?q=javascript - Success
{
  "statusCode": 200,
  "message": "Search completed successfully",
  "data": {
    "query": "javascript",
    "results": [
      {
        "id": "book-456",
        "name": "JavaScript: The Good Parts",
        "author": "Douglas Crockford",
        "price": 29.99,
        "stock": 15
      }
    ],
    "totalResults": 1
  }
}
```

### Shipment Tracking (Shipping)
```json
// GET /track/TRK12345678ABCD - Success
{
  "statusCode": 200,
  "message": "Tracking information retrieved successfully",
  "data": {
    "trackingNumber": "TRK12345678ABCD",
    "status": "in_transit",
    "estimatedDelivery": "2024-01-20T18:00:00Z",
    "trackingEvents": [
      {
        "status": "shipped",
        "description": "Package has been shipped",
        "timestamp": "2024-01-15T09:00:00Z"
      }
    ]
  }
}
```

## Benefits

1. **Consistency**: All APIs return the same response structure
2. **Predictability**: Frontend can handle responses uniformly
3. **Error Handling**: Standardized error messages and status codes
4. **Maintainability**: Centralized response handling logic
5. **Documentation**: Clear API contract for all endpoints