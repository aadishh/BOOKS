import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from 'dotenv';
import { Types } from 'mongoose';

// Load environment variables
config();

// Import configurations and models
import connectDB from './config/database';
import { connectRedis } from './config/redis';
import { User, Book, Order, Cart, Category } from './models';
import {
  IUser,
  AuthRequest,
  OTPData,
  LoginResponse,
  ApiResponse
} from './types';
import {
  generateOTP,
  generateToken,
  verifyToken,
  sendOTPEmail,
  toObjectId,
  JWTPayload
} from './utils/auth';
import { ResponseHandler } from './utils/response';
import { otpService } from './services/otpService';

const app = express();
const PORT = process.env.PORT || 2000;

// Connect to MongoDB and Redis
connectDB();
connectRedis();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    statusCode: 429,
    message: 'Too many requests from this IP, please try again later.',
    data: {}
  }
});
app.use(limiter);
// Clean expired OTPs (run every minute for in-memory fallback)
setInterval(() => {
  otpService.cleanupExpired();
}, 60000);

// Authentication middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    ResponseHandler.unauthorized(res, 'Access token required');
    return;
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    ResponseHandler.forbidden(res, 'Invalid token');
  }
};

// Role-based access control
const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      ResponseHandler.forbidden(res, 'Insufficient permissions');
      return;
    }
    next();
  };
};

// Auth routes
app.post('/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password }: { username: string; password: string } = req.body;

    if (!username || !password) {
      ResponseHandler.badRequest(res, 'Username and password are required');
      return;
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      isActive: true
    }) as IUser | null;

    if (!user || !await user.comparePassword(password)) {
      ResponseHandler.unauthorized(res, 'Invalid credentials');
      return;
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    if (user.twoFactorEnabled) {
      // Generate OTP and store it
      const otp = generateOTP();
      const otpKey = `${user._id}_${Date.now()}`;
      const expiresAt = Date.now() + (4 * 60 * 1000); // 4 minutes

      await otpService.set(otpKey, {
        userId: user._id.toString(),
        otp: otp,
        expiresAt: expiresAt,
        attempts: 0,
        maxAttempts: 3
      });

      // Send OTP via email
      const emailSent = await sendOTPEmail(user.email, otp, user.username);
      if (!emailSent) {
        ResponseHandler.serverError(res, 'Failed to send verification code. Please try again later.');
        return;
      }

      const tempToken = generateToken(
        { userId: user._id.toString(), step: '2fa', otpKey: otpKey },
        '5m'
      );

      const responseData: LoginResponse = {
        requiresTwoFactor: true,
        tempToken,
        expiresIn: '4 minutes'
      };

      ResponseHandler.success(res, responseData, 'Two-factor authentication required');
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role
    });

    const responseData: LoginResponse = {
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      }
    };

    ResponseHandler.success(res, responseData, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    ResponseHandler.serverError(res, 'Internal server error during login');
  }
});

app.post('/auth/verify-2fa', async (req: Request, res: Response): Promise<void> => {
  const { tempToken, code }: { tempToken: string; code: string } = req.body;

  if (!tempToken || !code) {
    ResponseHandler.badRequest(res, 'Temporary token and verification code are required');
    return;
  }

  try {
    const decoded = verifyToken(tempToken);
    console.log('Decoded token:', decoded);
    console.log('Step:', decoded.step);
    console.log('OtpKey:', decoded.otpKey);

    if (!decoded.step || !decoded.otpKey || !['2fa', 'signup-2fa'].includes(decoded.step)) {
      console.log('Validation failed - step:', decoded.step, 'otpKey:', decoded.otpKey);
      ResponseHandler.badRequest(res, 'Invalid verification token');
      return;
    }

    // Get OTP data from storage
    console.log('Looking for OTP key:', decoded.otpKey);
    console.log('Available OTP keys:', await otpService.getAllKeys());
    const otpData = await otpService.get(decoded.otpKey);
    console.log('Found OTP data:', otpData ? 'Yes' : 'No');

    if (!otpData) {
      ResponseHandler.unauthorized(res, 'Verification code expired or invalid. Please try again later.');
      return;
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      await otpService.delete(decoded.otpKey);
      ResponseHandler.unauthorized(res, 'Verification code expired. Please try again later.');
      return;
    }

    // Check attempt limit
    if (otpData.attempts >= otpData.maxAttempts) {
      await otpService.delete(decoded.otpKey);
      ResponseHandler.tooManyRequests(res, 'Too many failed attempts. Please try again later.');
      return;
    }

    // Verify OTP
    if (code !== otpData.otp) {
      otpData.attempts += 1;
      await otpService.set(decoded.otpKey, otpData);

      const remainingAttempts = otpData.maxAttempts - otpData.attempts;
      if (remainingAttempts > 0) {
        ResponseHandler.error(res, 'Invalid verification code', 401, { remainingAttempts });
        return;
      } else {
        await otpService.delete(decoded.otpKey);
        ResponseHandler.tooManyRequests(res, 'Too many failed attempts. Please try again later.');
        return;
      }
    }

    // OTP is valid - clean up and generate access token
    await otpService.delete(decoded.otpKey);

    let user: IUser | null = null;

    // Handle signup verification vs login verification
    if (decoded.step === 'signup-2fa') {
      // For signup, save the pending user first
      if (otpData.pendingUser) {
        await otpData.pendingUser.save();
        user = otpData.pendingUser;
      } else {
        ResponseHandler.serverError(res, 'User data not found. Please try signing up again.');
        return;
      }
    } else {
      // For login, find existing user
      user = await User.findById(decoded.userId) as IUser | null;
      if (!user) {
        ResponseHandler.notFound(res, 'User not found');
        return;
      }
    }

    if (!user) {
      ResponseHandler.serverError(res, 'User verification failed. Please try again.');
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role
    });

    const responseData: LoginResponse = {
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      }
    };

    const message = decoded.step === 'signup-2fa' ? 'Registration completed successfully' : 'Authentication successful';
    ResponseHandler.success(res, responseData, message);
  } catch (error) {
    console.error('2FA verification error:', error);
    ResponseHandler.unauthorized(res, 'Invalid or expired verification token');
  }
});

// User registration endpoint
app.post('/auth/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      username,
      password,
      email,
      role = 'user',
      twoFactorEnabled = false
    }: {
      username: string;
      password: string;
      email: string;
      role?: 'user' | 'admin';
      twoFactorEnabled?: boolean;
    } = req.body;

    // Validation
    if (!username || !password || !email) {
      ResponseHandler.badRequest(res, 'Username, password, and email are required');
      return;
    }

    if (password.length < 6) {
      ResponseHandler.badRequest(res, 'Password must be at least 6 characters long');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      ResponseHandler.badRequest(res, 'Please provide a valid email address');
      return;
    }

    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      ResponseHandler.conflict(res, 'Email already exists. Please use a different email address.');
      return;
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      ResponseHandler.conflict(res, 'Username already exists. Please choose a different username.');
      return;
    }

    // Validate role
    if (!['user', 'admin'].includes(role)) {
      ResponseHandler.badRequest(res, 'Invalid role. Must be "user" or "admin"');
      return;
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password, // Will be hashed by pre-save middleware
      role,
      twoFactorEnabled,
      emailVerified: !twoFactorEnabled // Auto-verify if 2FA is disabled
    }) as IUser;

    // If 2FA is enabled, send OTP for verification before saving user
    if (twoFactorEnabled) {
      const otp = generateOTP();
      const otpKey = `signup_${newUser._id}_${Date.now()}`;
      const expiresAt = Date.now() + (4 * 60 * 1000); // 4 minutes

      // Store OTP and user data temporarily
      await otpService.set(otpKey, {
        userId: newUser._id.toString(),
        otp: otp,
        expiresAt: expiresAt,
        attempts: 0,
        maxAttempts: 3,
        pendingUser: newUser // Store user data to save after verification
      });

      // Send OTP via email
      const emailSent = await sendOTPEmail(email, otp, username);
      if (!emailSent) {
        ResponseHandler.serverError(res, 'Failed to send verification code. Please try again later.');
        return;
      }

      const tempToken = generateToken(
        { userId: newUser._id.toString(), step: 'signup-2fa', otpKey: otpKey },
        '5m'
      );

      const responseData = {
        requiresTwoFactor: true,
        tempToken,
        expiresIn: '4 minutes'
      };

      ResponseHandler.success(res, responseData, 'Verification code sent to your email. Please verify to complete registration.');
      return;
    }

    // Save user immediately if 2FA is not enabled
    await newUser.save();

    // Generate token for immediate login
    const token = generateToken({
      userId: newUser._id.toString(),
      username: newUser.username,
      role: newUser.role
    });

    const responseData: LoginResponse = {
      token,
      user: {
        id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    };

    ResponseHandler.created(res, responseData, 'User created successfully');
  } catch (error) {
    console.error('Signup error:', error);
    ResponseHandler.serverError(res, 'Internal server error during signup');
  }
});

// Get user profile
app.get('/auth/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId) as IUser | null;
    if (!user) {
      ResponseHandler.notFound(res, 'User not found');
      return;
    }

    ResponseHandler.success(res, { user: user.toJSON() }, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Profile fetch error:', error);
    ResponseHandler.serverError(res, 'Internal server error');
  }
});

// Update user profile
app.put('/auth/profile', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, twoFactorEnabled, profile } = req.body;

    const user = await User.findById(req.user?.userId) as IUser | null;
    if (!user) {
      ResponseHandler.notFound(res, 'User not found');
      return;
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id }
      });
      if (existingUser) {
        ResponseHandler.conflict(res, 'Email already exists');
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

    ResponseHandler.success(res, { user: user.toJSON() }, 'Profile updated successfully');
  } catch (error) {
    console.error('Profile update error:', error);
    ResponseHandler.serverError(res, 'Internal server error');
  }
});

// Service proxy configurations
const services = {
  orders: 'http://localhost:2001',
  shipping: 'http://localhost:2002',
  books: 'http://localhost:2003'
};

// Proxy routes with authentication and user context
app.use('/api/orders', authenticateToken, createProxyMiddleware({
  target: services.orders,
  changeOrigin: true,
  pathRewrite: { '^/api/orders': '' },
  onProxyReq: (proxyReq, req: AuthRequest) => {
    // Add user context headers for the microservice
    if (req.user) {
      proxyReq.setHeader('x-user-id', req.user.userId.toString());
      proxyReq.setHeader('x-user-role', req.user.role);
      proxyReq.setHeader('x-username', req.user.username);
    }
  }
}));

app.use('/api/shipping', authenticateToken, createProxyMiddleware({
  target: services.shipping,
  changeOrigin: true,
  pathRewrite: { '^/api/shipping': '' },
  onProxyReq: (proxyReq, req: AuthRequest) => {
    if (req.user) {
      proxyReq.setHeader('x-user-id', req.user.userId.toString());
      proxyReq.setHeader('x-user-role', req.user.role);
      proxyReq.setHeader('x-username', req.user.username);
    }
  }
}));

app.use('/api/books', authenticateToken, createProxyMiddleware({
  target: services.books,
  changeOrigin: true,
  pathRewrite: { '^/api/books': '' },
  onProxyReq: (proxyReq, req: AuthRequest) => {
    if (req.user) {
      proxyReq.setHeader('x-user-id', req.user.userId.toString());
      proxyReq.setHeader('x-user-role', req.user.role);
      proxyReq.setHeader('x-username', req.user.username);
    }
  }
}));

// Admin-only routes
app.get('/api/admin/dashboard', authenticateToken, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const recentUsers = await User.find()
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

    ResponseHandler.success(res, dashboardData, 'Admin dashboard data retrieved successfully');
  } catch (error) {
    console.error('Admin dashboard error:', error);
    ResponseHandler.serverError(res, 'Failed to fetch dashboard data');
  }
});

app.get('/api/admin/users', authenticateToken, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;

    let query: any = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const totalUsers = await User.countDocuments(query);

    const responseData = {
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalUsers / Number(limit)),
        totalItems: totalUsers,
        itemsPerPage: Number(limit)
      }
    };

    ResponseHandler.success(res, responseData, 'Users retrieved successfully');
  } catch (error) {
    console.error('Admin users list error:', error);
    ResponseHandler.serverError(res, 'Failed to fetch users');
  }
});

app.get('/api/admin/users/:userId', authenticateToken, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password') as IUser | null;

    if (!user) {
      ResponseHandler.notFound(res, 'User not found');
      return;
    }

    ResponseHandler.success(res, { user }, 'User details retrieved successfully');
  } catch (error) {
    console.error('Admin user details error:', error);
    ResponseHandler.serverError(res, 'Failed to fetch user details');
  }
});

app.put('/api/admin/users/:userId/status', authenticateToken, authorizeRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password') as IUser | null;

    if (!user) {
      ResponseHandler.notFound(res, 'User not found');
      return;
    }

    ResponseHandler.success(res, { user }, `User ${isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    console.error('Admin user status update error:', error);
    ResponseHandler.serverError(res, 'Failed to update user status');
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  const healthData = {
    status: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };

  ResponseHandler.success(res, healthData, 'Health check successful');
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  const message = process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong';
  ResponseHandler.serverError(res, message);
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  ResponseHandler.notFound(res, 'Route not found');
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;