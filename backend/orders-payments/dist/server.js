"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const response_1 = require("./utils/response");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let userCarts = new Map();
let userWishlists = new Map();
let orders = [];
let payments = [];
const extractUserInfo = (req, res, next) => {
    req.userId = req.headers['x-user-id'];
    req.userRole = req.headers['x-user-role'];
    if (!req.userId) {
        response_1.ResponseHandler.unauthorized(res, 'User authentication required');
        return;
    }
    next();
};
const requireAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') {
        response_1.ResponseHandler.forbidden(res, 'Admin access required');
        return;
    }
    next();
};
const getUserCart = (userId) => {
    if (!userCarts.has(userId)) {
        userCarts.set(userId, {
            userId,
            items: [],
            updatedAt: new Date()
        });
    }
    return userCarts.get(userId);
};
const getUserWishlist = (userId) => {
    if (!userWishlists.has(userId)) {
        userWishlists.set(userId, {
            userId,
            items: [],
            updatedAt: new Date()
        });
    }
    return userWishlists.get(userId);
};
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
app.get('/cart', extractUserInfo, (req, res) => {
    const userCart = getUserCart(req.userId);
    const cartData = {
        cart: userCart.items,
        total: calculateTotal(userCart.items),
        updatedAt: userCart.updatedAt
    };
    response_1.ResponseHandler.success(res, cartData, 'Cart retrieved successfully');
});
app.post('/cart/add', extractUserInfo, (req, res) => {
    const { bookId, name, price, quantity = 1 } = req.body;
    const userCart = getUserCart(req.userId);
    const existingItem = userCart.items.find(item => item.bookId === bookId);
    if (existingItem) {
        existingItem.quantity += quantity;
    }
    else {
        userCart.items.push({
            id: (0, uuid_1.v4)(),
            bookId,
            name,
            price,
            quantity,
            addedAt: new Date()
        });
    }
    userCart.updatedAt = new Date();
    response_1.ResponseHandler.success(res, { cart: userCart.items }, 'Book added to cart');
});
app.put('/cart/update/:id', extractUserInfo, (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const userCart = getUserCart(req.userId);
    const item = userCart.items.find(item => item.id === id);
    if (!item) {
        response_1.ResponseHandler.notFound(res, 'Item not found in cart');
        return;
    }
    if (quantity <= 0) {
        userCart.items = userCart.items.filter(item => item.id !== id);
    }
    else {
        item.quantity = quantity;
    }
    userCart.updatedAt = new Date();
    response_1.ResponseHandler.success(res, { cart: userCart.items }, 'Cart updated');
});
app.delete('/cart/remove/:id', extractUserInfo, (req, res) => {
    const { id } = req.params;
    const userCart = getUserCart(req.userId);
    userCart.items = userCart.items.filter(item => item.id !== id);
    userCart.updatedAt = new Date();
    response_1.ResponseHandler.success(res, { cart: userCart.items }, 'Item removed from cart');
});
app.delete('/cart/clear', extractUserInfo, (req, res) => {
    const userCart = getUserCart(req.userId);
    userCart.items = [];
    userCart.updatedAt = new Date();
    response_1.ResponseHandler.success(res, {}, 'Cart cleared');
});
app.get('/wishlist', extractUserInfo, (req, res) => {
    const userWishlist = getUserWishlist(req.userId);
    const wishlistData = {
        wishlist: userWishlist.items,
        updatedAt: userWishlist.updatedAt
    };
    response_1.ResponseHandler.success(res, wishlistData, 'Wishlist retrieved successfully');
});
app.post('/wishlist/add', extractUserInfo, (req, res) => {
    const { bookId, name, price } = req.body;
    const userWishlist = getUserWishlist(req.userId);
    const existingItem = userWishlist.items.find(item => item.bookId === bookId);
    if (existingItem) {
        response_1.ResponseHandler.conflict(res, 'Book already in wishlist');
        return;
    }
    userWishlist.items.push({
        id: (0, uuid_1.v4)(),
        bookId,
        name,
        price,
        addedAt: new Date()
    });
    userWishlist.updatedAt = new Date();
    response_1.ResponseHandler.success(res, { wishlist: userWishlist.items }, 'Book added to wishlist');
});
app.delete('/wishlist/remove/:id', extractUserInfo, (req, res) => {
    const { id } = req.params;
    const userWishlist = getUserWishlist(req.userId);
    userWishlist.items = userWishlist.items.filter(item => item.id !== id);
    userWishlist.updatedAt = new Date();
    response_1.ResponseHandler.success(res, { wishlist: userWishlist.items }, 'Item removed from wishlist');
});
app.post('/wishlist/move-to-cart/:id', extractUserInfo, (req, res) => {
    const { id } = req.params;
    const userWishlist = getUserWishlist(req.userId);
    const userCart = getUserCart(req.userId);
    const wishlistItem = userWishlist.items.find(item => item.id === id);
    if (!wishlistItem) {
        response_1.ResponseHandler.notFound(res, 'Item not found in wishlist');
        return;
    }
    const existingCartItem = userCart.items.find(item => item.bookId === wishlistItem.bookId);
    if (existingCartItem) {
        existingCartItem.quantity += 1;
    }
    else {
        userCart.items.push({
            id: (0, uuid_1.v4)(),
            bookId: wishlistItem.bookId,
            name: wishlistItem.name,
            price: wishlistItem.price,
            quantity: 1,
            addedAt: new Date()
        });
    }
    userWishlist.items = userWishlist.items.filter(item => item.id !== id);
    userCart.updatedAt = new Date();
    userWishlist.updatedAt = new Date();
    const responseData = {
        cart: userCart.items,
        wishlist: userWishlist.items
    };
    response_1.ResponseHandler.success(res, responseData, 'Item moved to cart');
});
app.get('/orders', extractUserInfo, (req, res) => {
    const userOrders = orders.filter(order => order.userId === req.userId);
    response_1.ResponseHandler.success(res, { orders: userOrders }, 'Orders retrieved successfully');
});
app.get('/orders/history', extractUserInfo, (req, res) => {
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
    response_1.ResponseHandler.success(res, responseData, 'Order history retrieved successfully');
});
app.post('/orders', extractUserInfo, async (req, res) => {
    const { customerEmail, shippingAddress, paymentMethod } = req.body;
    const userCart = getUserCart(req.userId);
    if (userCart.items.length === 0) {
        response_1.ResponseHandler.badRequest(res, 'Cart is empty');
        return;
    }
    const order = {
        id: (0, uuid_1.v4)(),
        userId: req.userId,
        items: [...userCart.items],
        total: calculateTotal(userCart.items),
        customerEmail,
        shippingAddress,
        paymentMethod,
        status: 'pending',
        createdAt: new Date()
    };
    orders.push(order);
    const paymentResult = await processPayment(order);
    if (!paymentResult.success) {
        response_1.ResponseHandler.badRequest(res, `Payment failed: ${paymentResult.error}`);
        return;
    }
    order.status = 'confirmed';
    order.paymentId = paymentResult.paymentId;
    await sendOrderConfirmationEmail(order);
    userCart.items = [];
    userCart.updatedAt = new Date();
    response_1.ResponseHandler.created(res, { order }, 'Order created successfully');
});
app.get('/orders/:id', extractUserInfo, (req, res) => {
    const { id } = req.params;
    const order = orders.find(o => o.id === id);
    if (!order) {
        response_1.ResponseHandler.notFound(res, 'Order not found');
        return;
    }
    if (req.userRole !== 'admin' && order.userId !== req.userId) {
        response_1.ResponseHandler.forbidden(res, 'Access denied');
        return;
    }
    response_1.ResponseHandler.success(res, { order }, 'Order retrieved successfully');
});
app.get('/admin/users/stats', extractUserInfo, requireAdmin, (req, res) => {
    const userStats = [];
    const allUserIds = new Set();
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
        const lastActivity = Math.max(userCart?.updatedAt.getTime() || 0, userWishlist?.updatedAt.getTime() || 0, ...userOrders.map(order => order.createdAt.getTime()));
        userStats.push({
            userId,
            username: `user_${userId.slice(-8)}`,
            email: `user_${userId.slice(-8)}@mybooksdata.com`,
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
    response_1.ResponseHandler.success(res, responseData, 'User statistics retrieved successfully');
});
app.get('/admin/users/:userId/cart', extractUserInfo, requireAdmin, (req, res) => {
    const { userId } = req.params;
    const userCart = userCarts.get(userId);
    if (!userCart) {
        response_1.ResponseHandler.success(res, { cart: [], total: 0 }, 'User has no cart data');
        return;
    }
    const responseData = {
        userId,
        cart: userCart.items,
        total: calculateTotal(userCart.items),
        updatedAt: userCart.updatedAt
    };
    response_1.ResponseHandler.success(res, responseData, 'User cart retrieved successfully');
});
app.get('/admin/users/:userId/wishlist', extractUserInfo, requireAdmin, (req, res) => {
    const { userId } = req.params;
    const userWishlist = userWishlists.get(userId);
    if (!userWishlist) {
        response_1.ResponseHandler.success(res, { wishlist: [] }, 'User has no wishlist data');
        return;
    }
    const responseData = {
        userId,
        wishlist: userWishlist.items,
        updatedAt: userWishlist.updatedAt
    };
    response_1.ResponseHandler.success(res, responseData, 'User wishlist retrieved successfully');
});
app.get('/admin/users/:userId/orders', extractUserInfo, requireAdmin, (req, res) => {
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
    response_1.ResponseHandler.success(res, responseData, 'User orders retrieved successfully');
});
app.get('/admin/orders/all', extractUserInfo, requireAdmin, (req, res) => {
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
    response_1.ResponseHandler.success(res, responseData, 'All orders retrieved successfully');
});
app.get('/payments', (req, res) => {
    response_1.ResponseHandler.success(res, { payments }, 'Payments retrieved successfully');
});
app.post('/payments/process', async (req, res) => {
    const { orderId, amount, paymentMethod, cardDetails } = req.body;
    const payment = {
        id: (0, uuid_1.v4)(),
        orderId,
        amount,
        paymentMethod,
        status: 'processing',
        createdAt: new Date()
    };
    payments.push(payment);
    setTimeout(() => {
        const success = Math.random() > 0.1;
        payment.status = success ? 'completed' : 'failed';
        payment.processedAt = new Date();
        if (success) {
            payment.transactionId = `txn_${(0, uuid_1.v4)()}`;
        }
    }, 2000);
    response_1.ResponseHandler.success(res, { payment }, 'Payment processing');
});
function calculateTotal(cartItems) {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}
async function processPayment(order) {
    const success = Math.random() > 0.1;
    const payment = {
        id: (0, uuid_1.v4)(),
        orderId: order.id,
        amount: order.total,
        paymentMethod: order.paymentMethod,
        status: success ? 'completed' : 'failed',
        createdAt: new Date()
    };
    if (success) {
        payment.transactionId = `txn_${(0, uuid_1.v4)()}`;
    }
    payments.push(payment);
    return {
        success,
        paymentId: payment.id,
        error: success ? undefined : 'Payment processing failed'
    };
}
async function sendOrderConfirmationEmail(order) {
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
    }
    catch (error) {
        console.error('Failed to send email:', error);
    }
}
app.get('/health', (req, res) => {
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
    response_1.ResponseHandler.success(res, healthData, 'Health check successful');
});
app.listen(PORT, () => {
    console.log(`Orders/Payments service running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map