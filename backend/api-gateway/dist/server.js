"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const database_1 = __importDefault(require("./config/database"));
const redis_1 = require("./config/redis");
const models_1 = require("./models");
const auth_1 = require("./utils/auth");
const response_1 = require("./utils/response");
const otpService_1 = require("./services/otpService");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 2000;
(0, database_1.default)();
(0, redis_1.connectRedis)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        statusCode: 429,
        message: 'Too many requests from this IP, please try again later.',
        data: {}
    }
});
app.use(limiter);
setInterval(() => {
    otpService_1.otpService.cleanupExpired();
}, 60000);
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        response_1.ResponseHandler.unauthorized(res, 'Access token required');
        return;
    }
    try {
        const user = (0, auth_1.verifyToken)(token);
        req.user = user;
        next();
    }
    catch (err) {
        response_1.ResponseHandler.forbidden(res, 'Invalid token');
    }
};
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            response_1.ResponseHandler.forbidden(res, 'Insufficient permissions');
            return;
        }
        next();
    };
};
app.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            response_1.ResponseHandler.badRequest(res, 'Username and password are required');
            return;
        }
        const user = await models_1.User.findOne({
            $or: [{ username }, { email: username }],
            isActive: true
        });
        if (!user || !await user.comparePassword(password)) {
            response_1.ResponseHandler.unauthorized(res, 'Invalid credentials');
            return;
        }
        user.lastLogin = new Date();
        await user.save();
        if (user.twoFactorEnabled) {
            const otp = (0, auth_1.generateOTP)();
            const otpKey = `${user._id}_${Date.now()}`;
            const expiresAt = Date.now() + (4 * 60 * 1000);
            await otpService_1.otpService.set(otpKey, {
                userId: user._id.toString(),
                otp: otp,
                expiresAt: expiresAt,
                attempts: 0,
                maxAttempts: 3
            });
            const emailSent = await (0, auth_1.sendOTPEmail)(user.email, otp, user.username);
            if (!emailSent) {
                response_1.ResponseHandler.serverError(res, 'Failed to send verification code. Please try again later.');
                return;
            }
            const tempToken = (0, auth_1.generateToken)({ userId: user._id.toString(), step: '2fa', otpKey: otpKey }, '5m');
            const responseData = {
                requiresTwoFactor: true,
                tempToken,
                expiresIn: '4 minutes'
            };
            response_1.ResponseHandler.success(res, responseData, 'Two-factor authentication required');
            return;
        }
        const token = (0, auth_1.generateToken)({
            userId: user._id.toString(),
            username: user.username,
            role: user.role
        });
        const responseData = {
            token,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role
            }
        };
        response_1.ResponseHandler.success(res, responseData, 'Login successful');
    }
    catch (error) {
        console.error('Login error:', error);
        response_1.ResponseHandler.serverError(res, 'Internal server error during login');
    }
});
app.post('/auth/verify-2fa', async (req, res) => {
    const { tempToken, code } = req.body;
    if (!tempToken || !code) {
        response_1.ResponseHandler.badRequest(res, 'Temporary token and verification code are required');
        return;
    }
    try {
        const decoded = (0, auth_1.verifyToken)(tempToken);
        console.log('Decoded token:', decoded);
        console.log('Step:', decoded.step);
        console.log('OtpKey:', decoded.otpKey);
        if (!decoded.step || !decoded.otpKey || !['2fa', 'signup-2fa'].includes(decoded.step)) {
            console.log('Validation failed - step:', decoded.step, 'otpKey:', decoded.otpKey);
            response_1.ResponseHandler.badRequest(res, 'Invalid verification token');
            return;
        }
        console.log('Looking for OTP key:', decoded.otpKey);
        console.log('Available OTP keys:', await otpService_1.otpService.getAllKeys());
        const otpData = await otpService_1.otpService.get(decoded.otpKey);
        console.log('Found OTP data:', otpData ? 'Yes' : 'No');
        if (!otpData) {
            response_1.ResponseHandler.unauthorized(res, 'Verification code expired or invalid. Please try again later.');
            return;
        }
        if (Date.now() > otpData.expiresAt) {
            await otpService_1.otpService.delete(decoded.otpKey);
            response_1.ResponseHandler.unauthorized(res, 'Verification code expired. Please try again later.');
            return;
        }
        if (otpData.attempts >= otpData.maxAttempts) {
            await otpService_1.otpService.delete(decoded.otpKey);
            response_1.ResponseHandler.tooManyRequests(res, 'Too many failed attempts. Please try again later.');
            return;
        }
        if (code !== otpData.otp) {
            otpData.attempts += 1;
            await otpService_1.otpService.set(decoded.otpKey, otpData);
            const remainingAttempts = otpData.maxAttempts - otpData.attempts;
            if (remainingAttempts > 0) {
                response_1.ResponseHandler.error(res, 'Invalid verification code', 401, { remainingAttempts });
                return;
            }
            else {
                await otpService_1.otpService.delete(decoded.otpKey);
                response_1.ResponseHandler.tooManyRequests(res, 'Too many failed attempts. Please try again later.');
                return;
            }
        }
        await otpService_1.otpService.delete(decoded.otpKey);
        let user = null;
        if (decoded.step === 'signup-2fa') {
            if (otpData.pendingUser) {
                await otpData.pendingUser.save();
                user = otpData.pendingUser;
            }
            else {
                response_1.ResponseHandler.serverError(res, 'User data not found. Please try signing up again.');
                return;
            }
        }
        else {
            user = await models_1.User.findById(decoded.userId);
            if (!user) {
                response_1.ResponseHandler.notFound(res, 'User not found');
                return;
            }
        }
        if (!user) {
            response_1.ResponseHandler.serverError(res, 'User verification failed. Please try again.');
            return;
        }
        const token = (0, auth_1.generateToken)({
            userId: user._id.toString(),
            username: user.username,
            role: user.role
        });
        const responseData = {
            token,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                role: user.role
            }
        };
        const message = decoded.step === 'signup-2fa' ? 'Registration completed successfully' : 'Authentication successful';
        response_1.ResponseHandler.success(res, responseData, message);
    }
    catch (error) {
        console.error('2FA verification error:', error);
        response_1.ResponseHandler.unauthorized(res, 'Invalid or expired verification token');
    }
});
app.post('/auth/signup', async (req, res) => {
    try {
        const { username, password, email, role = 'user', twoFactorEnabled = false } = req.body;
        if (!username || !password || !email) {
            response_1.ResponseHandler.badRequest(res, 'Username, password, and email are required');
            return;
        }
        if (password.length < 6) {
            response_1.ResponseHandler.badRequest(res, 'Password must be at least 6 characters long');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            response_1.ResponseHandler.badRequest(res, 'Please provide a valid email address');
            return;
        }
        const existingUserByEmail = await models_1.User.findOne({ email });
        if (existingUserByEmail) {
            response_1.ResponseHandler.conflict(res, 'Email already exists. Please use a different email address.');
            return;
        }
        const existingUserByUsername = await models_1.User.findOne({ username });
        if (existingUserByUsername) {
            response_1.ResponseHandler.conflict(res, 'Username already exists. Please choose a different username.');
            return;
        }
        if (!['user', 'admin'].includes(role)) {
            response_1.ResponseHandler.badRequest(res, 'Invalid role. Must be "user" or "admin"');
            return;
        }
        const newUser = new models_1.User({
            username,
            email,
            password,
            role,
            twoFactorEnabled,
            emailVerified: !twoFactorEnabled
        });
        if (twoFactorEnabled) {
            const otp = (0, auth_1.generateOTP)();
            const otpKey = `signup_${newUser._id}_${Date.now()}`;
            const expiresAt = Date.now() + (4 * 60 * 1000);
            await otpService_1.otpService.set(otpKey, {
                userId: newUser._id.toString(),
                otp: otp,
                expiresAt: expiresAt,
                attempts: 0,
                maxAttempts: 3,
                pendingUser: newUser
            });
            const emailSent = await (0, auth_1.sendOTPEmail)(email, otp, username);
            if (!emailSent) {
                response_1.ResponseHandler.serverError(res, 'Failed to send verification code. Please try again later.');
                return;
            }
            const tempToken = (0, auth_1.generateToken)({ userId: newUser._id.toString(), step: 'signup-2fa', otpKey: otpKey }, '5m');
            const responseData = {
                requiresTwoFactor: true,
                tempToken,
                expiresIn: '4 minutes'
            };
            response_1.ResponseHandler.success(res, responseData, 'Verification code sent to your email. Please verify to complete registration.');
            return;
        }
        await newUser.save();
        const token = (0, auth_1.generateToken)({
            userId: newUser._id.toString(),
            username: newUser.username,
            role: newUser.role
        });
        const responseData = {
            token,
            user: {
                id: newUser._id.toString(),
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        };
        response_1.ResponseHandler.created(res, responseData, 'User created successfully');
    }
    catch (error) {
        console.error('Signup error:', error);
        response_1.ResponseHandler.serverError(res, 'Internal server error during signup');
    }
});
app.get('/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await models_1.User.findById(req.user?.userId);
        if (!user) {
            response_1.ResponseHandler.notFound(res, 'User not found');
            return;
        }
        response_1.ResponseHandler.success(res, { user: user.toJSON() }, 'Profile retrieved successfully');
    }
    catch (error) {
        console.error('Profile fetch error:', error);
        response_1.ResponseHandler.serverError(res, 'Internal server error');
    }
});
app.put('/auth/profile', authenticateToken, async (req, res) => {
    try {
        const { email, twoFactorEnabled, profile } = req.body;
        const user = await models_1.User.findById(req.user?.userId);
        if (!user) {
            response_1.ResponseHandler.notFound(res, 'User not found');
            return;
        }
        if (email && email !== user.email) {
            const existingUser = await models_1.User.findOne({
                email,
                _id: { $ne: user._id }
            });
            if (existingUser) {
                response_1.ResponseHandler.conflict(res, 'Email already exists');
                return;
            }
            user.email = email;
        }
        if (typeof twoFactorEnabled === 'boolean') {
            user.twoFactorEnabled = twoFactorEnabled;
        }
        if (profile) {
            user.profile = { ...user.profile, ...profile };
        }
        await user.save();
        response_1.ResponseHandler.success(res, { user: user.toJSON() }, 'Profile updated successfully');
    }
    catch (error) {
        console.error('Profile update error:', error);
        response_1.ResponseHandler.serverError(res, 'Internal server error');
    }
});
const services = {
    orders: 'http://localhost:2001',
    shipping: 'http://localhost:2002',
    books: 'http://localhost:2003'
};
app.use('/api/orders', authenticateToken, (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: services.orders,
    changeOrigin: true,
    pathRewrite: { '^/api/orders': '' },
    onProxyReq: (proxyReq, req) => {
        if (req.user) {
            proxyReq.setHeader('x-user-id', req.user.userId.toString());
            proxyReq.setHeader('x-user-role', req.user.role);
            proxyReq.setHeader('x-username', req.user.username);
        }
    }
}));
app.use('/api/shipping', authenticateToken, (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: services.shipping,
    changeOrigin: true,
    pathRewrite: { '^/api/shipping': '' },
    onProxyReq: (proxyReq, req) => {
        if (req.user) {
            proxyReq.setHeader('x-user-id', req.user.userId.toString());
            proxyReq.setHeader('x-user-role', req.user.role);
            proxyReq.setHeader('x-username', req.user.username);
        }
    }
}));
app.use('/api/books', authenticateToken, (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: services.books,
    changeOrigin: true,
    pathRewrite: { '^/api/books': '' },
    onProxyReq: (proxyReq, req) => {
        if (req.user) {
            proxyReq.setHeader('x-user-id', req.user.userId.toString());
            proxyReq.setHeader('x-user-role', req.user.role);
            proxyReq.setHeader('x-username', req.user.username);
        }
    }
}));
app.get('/api/admin/dashboard', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const totalUsers = await models_1.User.countDocuments();
        const activeUsers = await models_1.User.countDocuments({ isActive: true });
        const adminUsers = await models_1.User.countDocuments({ role: 'admin' });
        const recentUsers = await models_1.User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('username email role createdAt lastLogin');
        const dashboardData = {
            stats: {
                totalUsers,
                activeUsers,
                adminUsers,
                regularUsers: totalUsers - adminUsers
            },
            recentUsers
        };
        response_1.ResponseHandler.success(res, dashboardData, 'Admin dashboard data retrieved successfully');
    }
    catch (error) {
        console.error('Admin dashboard error:', error);
        response_1.ResponseHandler.serverError(res, 'Failed to fetch dashboard data');
    }
});
app.get('/api/admin/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { page = 1, limit = 10, search, role } = req.query;
        let query = {};
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }
        const users = await models_1.User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const totalUsers = await models_1.User.countDocuments(query);
        const responseData = {
            users,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalUsers / Number(limit)),
                totalItems: totalUsers,
                itemsPerPage: Number(limit)
            }
        };
        response_1.ResponseHandler.success(res, responseData, 'Users retrieved successfully');
    }
    catch (error) {
        console.error('Admin users list error:', error);
        response_1.ResponseHandler.serverError(res, 'Failed to fetch users');
    }
});
app.get('/api/admin/users/:userId', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await models_1.User.findById(userId).select('-password');
        if (!user) {
            response_1.ResponseHandler.notFound(res, 'User not found');
            return;
        }
        response_1.ResponseHandler.success(res, { user }, 'User details retrieved successfully');
    }
    catch (error) {
        console.error('Admin user details error:', error);
        response_1.ResponseHandler.serverError(res, 'Failed to fetch user details');
    }
});
app.put('/api/admin/users/:userId/status', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;
        const user = await models_1.User.findByIdAndUpdate(userId, { isActive }, { new: true }).select('-password');
        if (!user) {
            response_1.ResponseHandler.notFound(res, 'User not found');
            return;
        }
        response_1.ResponseHandler.success(res, { user }, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
    }
    catch (error) {
        console.error('Admin user status update error:', error);
        response_1.ResponseHandler.serverError(res, 'Failed to update user status');
    }
});
app.get('/health', (req, res) => {
    const healthData = {
        status: 'API Gateway is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    };
    response_1.ResponseHandler.success(res, healthData, 'Health check successful');
});
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    const message = process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong';
    response_1.ResponseHandler.serverError(res, message);
});
app.use('*', (req, res) => {
    response_1.ResponseHandler.notFound(res, 'Route not found');
});
app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map