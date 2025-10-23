# Microservice Architecture Backend (TypeScript)

This project implements a microservice architecture built with **TypeScript**, **Express.js**, and **MongoDB**. All services have been converted from JavaScript to TypeScript for better type safety, developer experience, and maintainability.

## Services
- **API Gateway** (Port 2000) - Central entry point with 2FA authentication, JWT tokens, and role-based access
- **Orders/Payments Service** (Port 2001) - Handles cart operations, order processing, payments, and email notifications
- **Shipping Service** (Port 2002) - Manages shipment creation, tracking, and delivery confirmations
- **Product Details Service** (Port 2003) - Manages book catalog, search functionality, and inventory

## Architecture
```
Client → API Gateway (Auth + Proxy) → [Orders/Payments, Shipping, Product Details]
                ↓
            MongoDB (User data, Books, Orders, etc.)
```

## Tech Stack
- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT + 2FA (Email OTP)
- **Email**: Nodemailer
- **Proxy**: http-proxy-middleware
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### Development Mode (Recommended)
```bash
# Install dependencies for all services
npm run install-all

# Start all services in development mode with hot reload
./start-dev.sh
# or
npm run dev-all
```

### Production Mode
```bash
# Install dependencies
npm run install-all

# Build all TypeScript services
npm run build-all

# Start all services
npm run start-all
# or
./start-services.sh
```

### Docker
```bash
# Start all services with Docker Compose
docker-compose up --build

# Stop services
docker-compose down
```

## API Endpoints
- **API Gateway**: http://localhost:2000
- **Orders/Payments**: http://localhost:2001  
- **Shipping**: http://localhost:2002
- **Product Details**: http://localhost:2003

## Complete API Documentation

### Authentication Endpoints

#### 1. User Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```
**Response (No 2FA):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "admin",
    "email": "admin@mybooksdata.com",
    "role": "admin"
  }
}
```
**Response (With 2FA):**
```json
{
  "requiresTwoFactor": true,
  "tempToken": "temp_jwt_token",
  "message": "Verification code sent to your email",
  "expiresIn": "4 minutes"
}
```

#### 2. Verify 2FA
```http
POST /auth/verify-2fa
Content-Type: application/json

{
  "tempToken": "temp_jwt_token",
  "code": "123456"
}
```
**Response:**
```json
{
  "message": "Authentication successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "admin",
    "email": "admin@mybooksdata.com",
    "role": "admin"
  }
}
```

#### 3. User Registration
```http
POST /auth/signup
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user",
  "twoFactorEnabled": false
}
```
**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "username": "newuser",
      "email": "newuser@example.com",
      "role": "user"
    }
  }
}
```

#### 4. Get User Profile
```http
GET /auth/profile
Authorization: Bearer jwt_token_here
```
**Response:**
```json
{
  "user": {
    "id": "user_id",
    "username": "admin",
    "email": "admin@mybooksdata.com",
    "role": "admin",
    "twoFactorEnabled": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 5. Update User Profile
```http
PUT /auth/profile
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "email": "newemail@example.com",
  "twoFactorEnabled": true,
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Cart Management (User-Specific)

#### 1. Get User Cart
```http
GET /api/orders/cart
Authorization: Bearer jwt_token_here
```
**Response:**
```json
{
  "cart": [
    {
      "id": "cart_item_id",
      "bookId": "book_id",
      "name": "Book Title",
      "price": 19.99,
      "quantity": 2,
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 39.98,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Add Item to Cart
```http
POST /api/orders/cart/add
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "bookId": "book_id",
  "name": "Book Title",
  "price": 19.99,
  "quantity": 1
}
```

#### 3. Update Cart Item
```http
PUT /api/orders/cart/update/:itemId
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "quantity": 3
}
```

#### 4. Remove Item from Cart
```http
DELETE /api/orders/cart/remove/:itemId
Authorization: Bearer jwt_token_here
```

#### 5. Clear Cart
```http
DELETE /api/orders/cart/clear
Authorization: Bearer jwt_token_here
```

### Wishlist Management

#### 1. Get User Wishlist
```http
GET /api/orders/wishlist
Authorization: Bearer jwt_token_here
```
**Response:**
```json
{
  "wishlist": [
    {
      "id": "wishlist_item_id",
      "bookId": "book_id",
      "name": "Book Title",
      "price": 19.99,
      "addedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Add to Wishlist
```http
POST /api/orders/wishlist/add
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "bookId": "book_id",
  "name": "Book Title",
  "price": 19.99
}
```

#### 3. Remove from Wishlist
```http
DELETE /api/orders/wishlist/remove/:itemId
Authorization: Bearer jwt_token_here
```

#### 4. Move Wishlist Item to Cart
```http
POST /api/orders/wishlist/move-to-cart/:itemId
Authorization: Bearer jwt_token_here
```

### Order Management

#### 1. Get User Orders
```http
GET /api/orders/orders
Authorization: Bearer jwt_token_here
```

#### 2. Get Order History (Paginated)
```http
GET /api/orders/orders/history?page=1&limit=10
Authorization: Bearer jwt_token_here
```

#### 3. Create Order
```http
POST /api/orders/orders
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "customerEmail": "user@example.com",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

#### 4. Get Order Details
```http
GET /api/orders/orders/:orderId
Authorization: Bearer jwt_token_here
```

### Book Catalog

#### 1. Get All Books (Paginated)
```http
GET /api/books/books?page=1&limit=10&category=Fiction&sortBy=price&sortOrder=asc
Authorization: Bearer jwt_token_here
```
**Response:**
```json
{
  "books": [
    {
      "id": "1",
      "name": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "category": "Fiction",
      "price": 12.99,
      "stock": 50,
      "description": "A classic American novel",
      "rating": 4.2,
      "reviews": 1250
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

#### 2. Search Books
```http
GET /api/books/books/search?q=gatsby&category=Fiction
Authorization: Bearer jwt_token_here
```

#### 3. Get Book Details
```http
GET /api/books/books/:bookId
Authorization: Bearer jwt_token_here
```

#### 4. Create Book (Admin Only)
```http
POST /api/books/books
Authorization: Bearer admin_jwt_token
Content-Type: application/json

{
  "name": "New Book",
  "author": "Author Name",
  "category": "Fiction",
  "price": 24.99,
  "stock": 100,
  "description": "Book description",
  "isbn": "978-0-123456-78-9",
  "pages": 300,
  "publisher": "Publisher Name",
  "publishedDate": "2024-01-01",
  "tags": ["fiction", "novel"]
}
```

#### 5. Update Book (Admin Only)
```http
PUT /api/books/books/:bookId
Authorization: Bearer admin_jwt_token
Content-Type: application/json

{
  "price": 19.99,
  "stock": 75
}
```

#### 6. Update Book Stock
```http
PATCH /api/books/books/:bookId/stock
Authorization: Bearer admin_jwt_token
Content-Type: application/json

{
  "quantity": 50,
  "operation": "add"
}
```

### Shipping Management

#### 1. Create Shipment
```http
POST /api/shipping/shipments
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "orderId": "order_id",
  "customerEmail": "user@example.com",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "items": [
    {
      "id": "item_id",
      "name": "Book Title",
      "quantity": 1,
      "price": 19.99
    }
  ],
  "shippingMethod": "standard"
}
```

#### 2. Track Shipment
```http
GET /api/shipping/track/:trackingNumber
Authorization: Bearer jwt_token_here
```
**Response:**
```json
{
  "trackingNumber": "TRK123456789",
  "status": "in_transit",
  "estimatedDelivery": "2024-01-05T00:00:00.000Z",
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "trackingEvents": [
    {
      "status": "shipped",
      "description": "Package has been shipped",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 3. Update Shipment Status
```http
PUT /api/shipping/shipments/:shipmentId/status
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "status": "delivered",
  "location": "New York, NY",
  "notes": "Delivered to front door"
}
```

### Admin Endpoints (Admin Role Required)

#### 1. Admin Dashboard
```http
GET /api/admin/dashboard
Authorization: Bearer admin_jwt_token
```
**Response:**
```json
{
  "message": "Admin dashboard data",
  "stats": {
    "totalUsers": 150,
    "activeUsers": 145,
    "adminUsers": 5,
    "regularUsers": 145
  },
  "recentUsers": [
    {
      "username": "newuser",
      "email": "newuser@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2. Get All Users
```http
GET /api/admin/users?page=1&limit=10&search=john&role=user
Authorization: Bearer admin_jwt_token
```

#### 3. Get User Details
```http
GET /api/admin/users/:userId
Authorization: Bearer admin_jwt_token
```

#### 4. Update User Status
```http
PUT /api/admin/users/:userId/status
Authorization: Bearer admin_jwt_token
Content-Type: application/json

{
  "isActive": false
}
```

#### 5. User Statistics
```http
GET /api/orders/admin/users/stats
Authorization: Bearer admin_jwt_token
```
**Response:**
```json
{
  "totalUsers": 150,
  "userStats": [
    {
      "userId": "user_id",
      "username": "user_123",
      "email": "user_123@mybooksdata.com",
      "cartItemsCount": 3,
      "wishlistItemsCount": 5,
      "totalOrders": 12,
      "totalSpent": 299.99,
      "lastActivity": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 6. View User's Cart (Admin)
```http
GET /api/orders/admin/users/:userId/cart
Authorization: Bearer admin_jwt_token
```

#### 7. View User's Wishlist (Admin)
```http
GET /api/orders/admin/users/:userId/wishlist
Authorization: Bearer admin_jwt_token
```

#### 8. View User's Orders (Admin)
```http
GET /api/orders/admin/users/:userId/orders
Authorization: Bearer admin_jwt_token
```

#### 9. View All Orders (Admin)
```http
GET /api/orders/admin/orders/all?page=1&limit=20&status=confirmed
Authorization: Bearer admin_jwt_token
```

### Health Check Endpoints

#### 1. API Gateway Health
```http
GET /health
```

#### 2. Orders Service Health
```http
GET /api/orders/health
Authorization: Bearer jwt_token_here
```

#### 3. Books Service Health
```http
GET /api/books/health
Authorization: Bearer jwt_token_here
```

#### 4. Shipping Service Health
```http
GET /api/shipping/health
Authorization: Bearer jwt_token_here
```

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

### Pagination Response
```json
{
  "data": [ /* array of items */ ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10
  }
}
```

## Authentication Headers
All protected endpoints require:
```
Authorization: Bearer your_jwt_token_here
```

## Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Response**: 429 Too Many Requests when exceeded

## Project Structure
```
├── api-gateway/           # API Gateway with authentication
│   ├── src/
│   │   ├── config/        # Database configuration
│   │   ├── models/        # MongoDB models
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   └── server.ts      # Main server file
│   ├── dist/              # Compiled JavaScript (generated)
│   ├── package.json
│   └── tsconfig.json
├── orders-payments/       # Orders and payments service
│   ├── src/
│   │   ├── types/         # TypeScript type definitions
│   │   └── server.ts      # Main server file
│   ├── dist/              # Compiled JavaScript (generated)
│   ├── package.json
│   └── tsconfig.json
├── shipping/              # Shipping and tracking service
│   ├── src/
│   │   ├── types/         # TypeScript type definitions
│   │   └── server.ts      # Main server file
│   ├── dist/              # Compiled JavaScript (generated)
│   ├── package.json
│   └── tsconfig.json
├── product-details/       # Book catalog service
│   ├── src/
│   │   ├── types/         # TypeScript type definitions
│   │   └── server.ts      # Main server file
│   ├── dist/              # Compiled JavaScript (generated)
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml     # Docker configuration
├── start-services.sh      # Production startup script
├── start-dev.sh          # Development startup script
└── package.json          # Root package.json
```

## TypeScript Features
- **Strict Type Checking**: All services use strict TypeScript configuration
- **Interface Definitions**: Comprehensive type definitions for all data models
- **Type Safety**: Request/response types, middleware types, and error handling
- **Modern ES Features**: ES2020 target with full async/await support
- **Development Experience**: Hot reload with ts-node and nodemon

## Authentication & Security
- **JWT Tokens**: Secure authentication with configurable expiration
- **2FA Support**: Email-based OTP verification (4-minute expiry)
- **Role-Based Access**: Admin and user roles with different permissions
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable cross-origin resource sharing

## Default Users
- **Admin**: username=`admin`, password=`password`, email=`admin@mybooksdata.com` (2FA enabled)
- **User**: username=`user`, password=`password`, email=`user@mybooksdata.com` (2FA disabled)

## New Features Added

### User-Specific Data Management
- **Individual Carts**: Each user maintains their own cart based on user ID
- **Wishlist System**: Users can save books to wishlist and move them to cart
- **Order History**: Complete order history with pagination per user
- **User Isolation**: Users can only access their own data

### Admin Features
- **User Analytics**: View all users, their cart contents, and order history
- **Admin Dashboard**: Comprehensive statistics and user management
- **User Management**: Activate/deactivate users, view user details
- **System Overview**: Total users, orders, and activity monitoring

### API Enhancements
- **Role-Based Access**: Admin-only endpoints for user data access
- **User Context**: All requests include user information via headers
- **Pagination**: Efficient data loading for large datasets
- **Search & Filtering**: Advanced filtering options for admin views

## Environment Variables
Create `.env` files in each service directory:

### API Gateway (.env)
```
PORT=2000
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb://localhost:27017/myBooksData
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=development
```

### Other Services (.env)
```
PORT=200X  # 2001, 2002, 2003
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
NODE_ENV=development
```

## Available Scripts
```bash
# Root level scripts
npm run install-all    # Install dependencies for all services
npm run build-all      # Build TypeScript for all services
npm run start-all      # Start all services in production mode
npm run dev-all        # Start all services in development mode
npm run clean-all      # Clean build directories

# Individual service scripts (run in service directory)
npm run build          # Build TypeScript
npm run start          # Start compiled JavaScript
npm run dev            # Start with hot reload
npm run clean          # Clean build directory
```

## Development
1. **Hot Reload**: Use `npm run dev` in each service for automatic restarts
2. **Type Checking**: TypeScript compiler will catch type errors during development
3. **Debugging**: Source maps are generated for easier debugging
4. **Linting**: Configure ESLint and Prettier for code quality

## Production Deployment
1. **Build**: Run `npm run build-all` to compile TypeScript
2. **Environment**: Set `NODE_ENV=production`
3. **Database**: Configure MongoDB connection string
4. **Email**: Set up email service credentials
5. **Security**: Change JWT secret and other sensitive values

## API Documentation
Detailed API documentation is available in `API_DOCUMENTATION.md`.