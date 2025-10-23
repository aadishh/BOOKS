import express, { Request, Response } from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { 
  CartItem, 
  UserCart,
  WishlistItem,
  UserWishlist,
  Order, 
  Payment, 
  PaymentResult, 
  ShippingAddress,
  UserStats
} from './types';
import { ResponseHandler } from './utils/response';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Mock databases - now user-specific
let userCarts: Map<string, UserCart> = new Map();
let userWishlists: Map<string, UserWishlist> = new Map();
let orders: Order[] = [];
let payments: Payment[] = [];

// Middleware to extract user info from headers (set by API Gateway)
interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

const extractUserInfo = (req: AuthenticatedRequest, res: Response, next: any): void => {
  // In a real app, this would come from JWT token via API Gateway
  req.userId = req.headers['x-user-id'] as string;
  req.userRole = req.headers['x-user-role'] as string;
  
  if (!req.userId) {
    ResponseHandler.unauthorized(res, 'User authentication required');
    return;
  }
  next();
};

// Admin-only middleware
const requireAdmin = (req: AuthenticatedRequest, res: Response, next: any): void => {
  if (req.userRole !== 'admin') {
    ResponseHandler.forbidden(res, 'Admin access required');
    return;
  }
  next();
};

// Helper function to get or create user cart
const getUserCart = (userId: string): UserCart => {
  if (!userCarts.has(userId)) {
    userCarts.set(userId, {
      userId,
      items: [],
      updatedAt: new Date()
    });
  }
  return userCarts.get(userId)!;
};

// Helper function to get or create user wishlist
const getUserWishlist = (userId: string): UserWishlist => {
  if (!userWishlists.has(userId)) {
    userWishlists.set(userId, {
      userId,
      items: [],
      updatedAt: new Date()
    });
  }
  return userWishlists.get(userId)!;
};

// Email transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Cart operations (user-specific)
app.get('/cart', extractUserInfo, (req: AuthenticatedRequest, res: Response): void => {
  const userCart = getUserCart(req.userId!);
  const cartData = { 
    cart: userCart.items, 
    total: calculateTotal(userCart.items),
    updatedAt: userCart.updatedAt
  };
  ResponseHandler.success(res, cartData, 'Cart retrieved successfully');
});

app.post('/cart/add', extractUserInfo, (req: AuthenticatedRequest, res: Response): void => {
  const { bookId, name, price, quantity = 1 }: { 
    bookId: string; 
    name: string; 
    price: number; 
    quantity?: number; 
  } = req.body;
  
  const userCart = getUserCart(req.userId!);
  const existingItem = userCart.items.find(item => item.bookId === bookId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    userCart.items.push({
      id: uuidv4(),
      bookId,
      name,
      price,
      quantity,
      addedAt: new Date()
    });
  }
  
  userCart.updatedAt = new Date();
  ResponseHandler.success(res, { cart: userCart.items }, 'Book added to cart');
});

app.put('/cart/update/:id', extractUserInfo, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const { quantity }: { quantity: number } = req.body;
  
  const userCart = getUserCart(req.userId!);
  const item = userCart.items.find(item => item.id === id);
  
  if (!item) {
    ResponseHandler.notFound(res, 'Item not found in cart');
    return;
  }
  
  if (quantity <= 0) {
    userCart.items = userCart.items.filter(item => item.id !== id);
  } else {
    item.quantity = quantity;
  }
  
  userCart.updatedAt = new Date();
  ResponseHandler.success(res, { cart: userCart.items }, 'Cart updated');
});

app.delete('/cart/remove/:id', extractUserInfo, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const userCart = getUserCart(req.userId!);
  userCart.items = userCart.items.filter(item => item.id !== id);
  userCart.updatedAt = new Date();
  ResponseHandler.success(res, { cart: userCart.items }, 'Item removed from cart');
});

app.delete('/cart/clear', extractUserInfo, (req: AuthenticatedRequest, res: Response): void => {
  const userCart = getUserCart(req.userId!);
  userCart.items = [];
  userCart.updatedAt = new Date();
  ResponseHandler.success(res, {}, 'Cart cleared');
});

// Wishlist operations
app.get('/wishlist', extractUserInfo, (req: AuthenticatedRequest, res: Response): void => {
  const userWishlist = getUserWishlist(req.userId!);
  const wishlistData = { 
    wishlist: userWishlist.items,
    updatedAt: userWishlist.updatedAt
  };
  ResponseHandler.success(res, wishlistData, 'Wishlist retrieved successfully');
});

app.post('/wishlist/add', extractUserInfo, (req: AuthenticatedRequest, res: Response): void => {
  const { bookId, name, price }: { 
    bookId: string; 
    name: string; 
    price: number; 
  } = req.body;
  
  const userWishlist = getUserWishlist(req.userId!);
  const existingItem = userWishlist.items.find(item => item.bookId === bookId);
  
  if (existingItem) {
    ResponseHandler.conflict(res, 'Book already in wishlist');
    return;
  }
  
  userWishlist.items.push({
    id: uuidv4(),
    bookId,
    name,
    price,
    addedAt: new Date()
  });
  
  userWishlist.updatedAt = new Date();
  ResponseHandler.success(res, { wishlist: userWishlist.items }, 'Book added to wishlist');
});

app.delete('/wishlist/remove/:id', extractUserInfo, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const userWishlist = getUserWishlist(req.userId!);
  userWishlist.items = userWishlist.items.filter(item => item.id !== id);
  userWishlist.updatedAt = new Date();
  ResponseHandler.success(res, { wishlist: userWishlist.items }, 'Item removed from wishlist');
});

app.post('/wishlist/move-to-cart/:id', extractUserInfo, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const userWishlist = getUserWishlist(req.userId!);
  const userCart = getUserCart(req.userId!);
  
  const wishlistItem = userWishlist.items.find(item => item.id === id);
  if (!wishlistItem) {
    ResponseHandler.notFound(res, 'Item not found in wishlist');
    return;
  }
  
  // Add to cart
  const existingCartItem = userCart.items.find(item => item.bookId === wishlistItem.bookId);
  if (existingCartItem) {
    existingCartItem.quantity += 1;
  } else {
    userCart.items.push({
      id: uuidv4(),
      bookId: wishlistItem.bookId,
      name: wishlistItem.name,
      price: wishlistItem.price,
      quantity: 1,
      addedAt: new Date()
    });
  }
  
  // Remove from wishlist
  userWishlist.items = userWishlist.items.filter(item => item.id !== id);
  
  userCart.updatedAt = new Date();
  userWishlist.updatedAt = new Date();
  
  const responseData = { 
    cart: userCart.items,
    wishlist: userWishlist.items
  };
  ResponseHandler.success(res, responseData, 'Item moved to cart');
});

// Order operations
// Get user's orders
app.get('/orders', extractUserInfo, (req: AuthenticatedRequest, res: Response): void => {
  const userOrders = orders.filter(order => order.userId === req.userId);
  ResponseHandler.success(res, { orders: userOrders }, 'Orders retrieved successfully');
});

// Get order history with pagination
app.get('/orders/history', extractUserInfo, (req: AuthenticatedRequest, res: Response): void => {
  const { page = 1, limit = 10 } = req.query;
  const userOrders = orders.filter(order => order.userId === req.userId);
  
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedOrders = userOrders.slice(startIndex, endIndex);
  
  const responseData = { 
    orders: paginatedOrders,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(userOrders.length / Number(limit)),
      totalItems: userOrders.length,
      itemsPerPage: Number(limit)
    }
  };
  ResponseHandler.success(res, responseData, 'Order history retrieved successfully');
});

app.post('/orders', extractUserInfo, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { 
    customerEmail, 
    shippingAddress, 
    paymentMethod 
  }: { 
    customerEmail: string; 
    shippingAddress: ShippingAddress; 
    paymentMethod: string; 
  } = req.body;
  
  const userCart = getUserCart(req.userId!);
  
  if (userCart.items.length === 0) {
    ResponseHandler.badRequest(res, 'Cart is empty');
    return;
  }
  
  const order: Order = {
    id: uuidv4(),
    userId: req.userId!,
    items: [...userCart.items],
    total: calculateTotal(userCart.items),
    customerEmail,
    shippingAddress,
    paymentMethod,
    status: 'pending',
    createdAt: new Date()
  };
  
  orders.push(order);
  
  // Process payment
  const paymentResult = await processPayment(order);
  if (!paymentResult.success) {
    ResponseHandler.badRequest(res, `Payment failed: ${paymentResult.error}`);
    return;
  }
  
  order.status = 'confirmed';
  order.paymentId = paymentResult.paymentId;
  
  // Send confirmation email
  await sendOrderConfirmationEmail(order);
  
  // Clear user's cart after successful order
  userCart.items = [];
  userCart.updatedAt = new Date();
  
  ResponseHandler.created(res, { order }, 'Order created successfully');
});

app.get('/orders/:id', extractUserInfo, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const order = orders.find(o => o.id === id);
  
  if (!order) {
    ResponseHandler.notFound(res, 'Order not found');
    return;
  }
  
  // Users can only see their own orders, admins can see all
  if (req.userRole !== 'admin' && order.userId !== req.userId) {
    ResponseHandler.forbidden(res, 'Access denied');
    return;
  }
  
  ResponseHandler.success(res, { order }, 'Order retrieved successfully');
});

// Admin-only endpoints
app.get('/admin/users/stats', extractUserInfo, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const userStats: UserStats[] = [];
  
  // Get all unique user IDs from carts, wishlists, and orders
  const allUserIds = new Set<string>();
  userCarts.forEach((_, userId) => allUserIds.add(userId));
  userWishlists.forEach((_, userId) => allUserIds.add(userId));
  orders.forEach(order => allUserIds.add(order.userId));
  
  allUserIds.forEach(userId => {
    const userCart = userCarts.get(userId);
    const userWishlist = userWishlists.get(userId);
    const userOrders = orders.filter(order => order.userId === userId);
    
    const totalSpent = userOrders
      .filter(order => order.status === 'confirmed')
      .reduce((sum, order) => sum + order.total, 0);
    
    const lastActivity = Math.max(
      userCart?.updatedAt.getTime() || 0,
      userWishlist?.updatedAt.getTime() || 0,
      ...userOrders.map(order => order.createdAt.getTime())
    );
    
    userStats.push({
      userId,
      username: `user_${userId.slice(-8)}`, // Mock username
      email: `user_${userId.slice(-8)}@mybooksdata.com`, // Mock email
      cartItemsCount: userCart?.items.length || 0,
      wishlistItemsCount: userWishlist?.items.length || 0,
      totalOrders: userOrders.length,
      totalSpent,
      lastActivity: new Date(lastActivity)
    });
  });
  
  const responseData = { 
    totalUsers: userStats.length,
    userStats: userStats.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
  };
  ResponseHandler.success(res, responseData, 'User statistics retrieved successfully');
});

app.get('/admin/users/:userId/cart', extractUserInfo, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { userId } = req.params;
  const userCart = userCarts.get(userId);
  
  if (!userCart) {
    ResponseHandler.success(res, { cart: [], total: 0 }, 'User has no cart data');
    return;
  }
  
  const responseData = { 
    userId,
    cart: userCart.items,
    total: calculateTotal(userCart.items),
    updatedAt: userCart.updatedAt
  };
  ResponseHandler.success(res, responseData, 'User cart retrieved successfully');
});

app.get('/admin/users/:userId/wishlist', extractUserInfo, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { userId } = req.params;
  const userWishlist = userWishlists.get(userId);
  
  if (!userWishlist) {
    ResponseHandler.success(res, { wishlist: [] }, 'User has no wishlist data');
    return;
  }
  
  const responseData = { 
    userId,
    wishlist: userWishlist.items,
    updatedAt: userWishlist.updatedAt
  };
  ResponseHandler.success(res, responseData, 'User wishlist retrieved successfully');
});

app.get('/admin/users/:userId/orders', extractUserInfo, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { userId } = req.params;
  const userOrders = orders.filter(order => order.userId === userId);
  
  const responseData = { 
    userId,
    orders: userOrders,
    totalOrders: userOrders.length,
    totalSpent: userOrders
      .filter(order => order.status === 'confirmed')
      .reduce((sum, order) => sum + order.total, 0)
  };
  ResponseHandler.success(res, responseData, 'User orders retrieved successfully');
});

app.get('/admin/orders/all', extractUserInfo, requireAdmin, (req: AuthenticatedRequest, res: Response): void => {
  const { page = 1, limit = 20, status } = req.query;
  
  let filteredOrders = orders;
  if (status) {
    filteredOrders = orders.filter(order => order.status === status);
  }
  
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);
  
  const responseData = { 
    orders: paginatedOrders,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(filteredOrders.length / Number(limit)),
      totalItems: filteredOrders.length,
      itemsPerPage: Number(limit)
    },
    summary: {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length
    }
  };
  ResponseHandler.success(res, responseData, 'All orders retrieved successfully');
});

// Payment operations
app.get('/payments', (req: Request, res: Response) => {
  ResponseHandler.success(res, { payments }, 'Payments retrieved successfully');
});

app.post('/payments/process', async (req: Request, res: Response) => {
  const { 
    orderId, 
    amount, 
    paymentMethod, 
    cardDetails 
  }: { 
    orderId: string; 
    amount: number; 
    paymentMethod: string; 
    cardDetails?: any; 
  } = req.body;
  
  const payment: Payment = {
    id: uuidv4(),
    orderId,
    amount,
    paymentMethod,
    status: 'processing',
    createdAt: new Date()
  };
  
  payments.push(payment);
  
  // Mock payment processing
  setTimeout(() => {
    const success = Math.random() > 0.1; // 90% success rate
    payment.status = success ? 'completed' : 'failed';
    payment.processedAt = new Date();
    
    if (success) {
      payment.transactionId = `txn_${uuidv4()}`;
    }
  }, 2000);
  
  ResponseHandler.success(res, { payment }, 'Payment processing');
});

// Helper functions
function calculateTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

async function processPayment(order: Order): Promise<PaymentResult> {
  // Mock payment processing
  const success = Math.random() > 0.1; // 90% success rate
  
  const payment: Payment = {
    id: uuidv4(),
    orderId: order.id,
    amount: order.total,
    paymentMethod: order.paymentMethod,
    status: success ? 'completed' : 'failed',
    createdAt: new Date()
  };
  
  if (success) {
    payment.transactionId = `txn_${uuidv4()}`;
  }
  
  payments.push(payment);
  
  return {
    success,
    paymentId: payment.id,
    error: success ? undefined : 'Payment processing failed'
  };
}

async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.id}`,
      html: `
        <h2>Order Confirmation</h2>
        <p>Thank you for your order!</p>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <h3>Items:</h3>
        <ul>
          ${order.items.map(item => `
            <li>${item.name} - Quantity: ${item.quantity} - ${(item.price * item.quantity).toFixed(2)}</li>
          `).join('')}
        </ul>
        <p>We'll send you tracking information once your order ships.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${order.customerEmail}`);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  const totalCartItems = Array.from(userCarts.values())
    .reduce((sum, cart) => sum + cart.items.length, 0);
  const totalWishlistItems = Array.from(userWishlists.values())
    .reduce((sum, wishlist) => sum + wishlist.items.length, 0);
    
  const healthData = { 
    status: 'Orders/Payments service is running', 
    timestamp: new Date().toISOString(),
    stats: {
      totalUsers: userCarts.size,
      totalCartItems,
      totalWishlistItems,
      totalOrders: orders.length,
      totalPayments: payments.length,
      ordersByStatus: {
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      }
    }
  };
  
  ResponseHandler.success(res, healthData, 'Health check successful');
});

app.listen(PORT, () => {
  console.log(`Orders/Payments service running on port ${PORT}`);
});