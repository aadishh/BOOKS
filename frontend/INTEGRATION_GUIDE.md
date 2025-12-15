# Backend API Integration Guide

This guide explains how the frontend is integrated with the backend microservices.

## Overview

The frontend is now fully integrated with the backend API Gateway running on `http://localhost:2000`. All API calls go through the gateway which handles authentication and routes requests to the appropriate microservices.

## Configuration

### Environment Variables

Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:2000
```

For production, change to your production API URL.

## API Integration

### 1. Authentication

The authentication system supports:
- Username/password login
- Two-factor authentication (2FA) via email
- User registration
- Profile management

**Example: Login with 2FA**
```typescript
import { loginUser, verify2FA } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const { setUser, setToken } = useAuth();

// Step 1: Login
const response = await loginUser({ username, password });

if (response.data.requiresTwoFactor) {
  // Step 2: Show 2FA form and verify
  const verifyResponse = await verify2FA({
    tempToken: response.data.tempToken,
    code: userEnteredCode
  });
  
  setToken(verifyResponse.data.token);
  setUser(verifyResponse.data.user);
}
```

### 2. Cart Management

Use the `useCart` hook for cart operations:

```typescript
import { useCart } from '@/hooks/useCart';

function CartComponent() {
  const { cart, addItem, updateItem, removeItem, clear, total, itemCount } = useCart();

  const handleAddToCart = async (book) => {
    await addItem(book.id, book.name, book.price, 1);
  };

  return (
    <div>
      <p>Items: {itemCount}</p>
      <p>Total: ${total}</p>
      {cart?.cart.map(item => (
        <div key={item.id}>
          <p>{item.name} - ${item.price} x {item.quantity}</p>
          <button onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Wishlist Management

Use the `useWishlist` hook:

```typescript
import { useWishlist } from '@/hooks/useWishlist';

function WishlistComponent() {
  const { wishlist, addItem, removeItem, moveToCart } = useWishlist();

  return (
    <div>
      {wishlist?.wishlist.map(item => (
        <div key={item.id}>
          <p>{item.name} - ${item.price}</p>
          <button onClick={() => moveToCart(item.id)}>Move to Cart</button>
          <button onClick={() => removeItem(item.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

### 4. Books Catalog

Fetch and display books:

```typescript
import { getBooks, searchBooks, getBookDetails } from '@/lib/api';

// Get paginated books
const response = await getBooks({
  page: 1,
  limit: 10,
  category: 'Fiction',
  sortBy: 'price',
  sortOrder: 'asc'
});

const books = response.data.data;
const pagination = response.data.pagination;

// Search books
const searchResponse = await searchBooks('javascript', 'Programming');
const results = searchResponse.data.results;

// Get book details
const bookResponse = await getBookDetails(bookId);
const book = bookResponse.data.book;
```

### 5. Orders

Create and manage orders:

```typescript
import { createOrder, getUserOrders, getOrderHistory } from '@/lib/api';

// Create order from cart
const orderResponse = await createOrder({
  customerEmail: user.email,
  shippingAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  },
  paymentMethod: 'credit_card'
});

// Get user orders
const ordersResponse = await getUserOrders();
const orders = ordersResponse.data.orders;

// Get paginated order history
const historyResponse = await getOrderHistory(1, 10);
const orderHistory = historyResponse.data.data;
```

### 6. Shipment Tracking

Track shipments:

```typescript
import { trackShipment } from '@/lib/api';

const shipmentResponse = await trackShipment('TRK123456789');
const shipment = shipmentResponse.data;

console.log(shipment.status); // 'in_transit'
console.log(shipment.estimatedDelivery);
console.log(shipment.trackingEvents);
```

### 7. Admin Features

Admin-only operations:

```typescript
import { 
  getAdminDashboard, 
  getAllUsers, 
  createBook, 
  updateBook 
} from '@/lib/api';

// Admin dashboard
const dashboardResponse = await getAdminDashboard();
const stats = dashboardResponse.data.stats;

// Get all users
const usersResponse = await getAllUsers({ page: 1, limit: 20 });
const users = usersResponse.data.data;

// Create book (admin only)
const bookResponse = await createBook({
  name: 'New Book',
  author: 'Author Name',
  category: 'Fiction',
  price: 24.99,
  stock: 100,
  description: 'Book description'
});
```

## Authentication Context

The `AuthContext` provides:

```typescript
const { user, token, setUser, setToken, logout } = useAuth();

// user: Current user object or null
// token: JWT token or null
// setUser: Update user state
// setToken: Update token state
// logout: Clear user and token
```

The context automatically syncs with localStorage, so authentication persists across page refreshes.

## API Response Format

All API responses follow this standard format:

```typescript
{
  statusCode: 200,
  message: "Operation successful",
  data: { /* response data */ }
}
```

Check `statusCode` to determine success:
- `200`: Success
- `201`: Created
- `400`: Bad request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `500`: Server error

## Error Handling

All API functions throw errors on failure. Use try-catch:

```typescript
try {
  const response = await getBooks();
  // Handle success
} catch (error) {
  console.error('Error:', error.message);
  // Show error to user
}
```

## Starting the Backend

Before using the frontend, start the backend services:

```bash
cd backend

# Development mode (recommended)
npm run dev-all

# Or use the script
./start-dev.sh
```

This starts:
- API Gateway: http://localhost:2000
- Orders/Payments: http://localhost:2001
- Shipping: http://localhost:2002
- Product Details: http://localhost:2003

## Testing the Integration

1. Start the backend services
2. Start the frontend: `npm run dev`
3. Open http://localhost:3000
4. Try logging in with default users:
   - Admin: username=`admin`, password=`password` (has 2FA)
   - User: username=`user`, password=`password` (no 2FA)

## Key Files

- `src/lib/api.ts` - All API functions
- `src/types/index.ts` - TypeScript types
- `src/context/AuthContext.tsx` - Authentication state
- `src/hooks/useCart.ts` - Cart management hook
- `src/hooks/useWishlist.ts` - Wishlist management hook
- `.env.local` - Environment configuration

## Migration Notes

If you have existing components using the old API:

1. Update `loginUser` calls to use `username` instead of `email`
2. Replace `userData` with `user` and `token` from `useAuth()`
3. Check response format: use `response.statusCode` and `response.data`
4. Handle 2FA flow if user has it enabled
5. Use the new hooks (`useCart`, `useWishlist`) for better state management

## Next Steps

1. Update remaining components to use the new API
2. Add loading states and error handling
3. Implement order checkout flow
4. Add shipment tracking UI
5. Build admin dashboard
6. Add form validation
7. Implement search functionality
8. Add pagination controls
