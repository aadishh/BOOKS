import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { Types } from 'mongoose';

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// JWT Payload interface
export interface JWTPayload {
  userId: string;
  username?: string;
  role?: string;
  step?: string;
  otpKey?: string;
}

// Generate JWT token
export const generateToken = (payload: JWTPayload, expiresIn: string = '24h'): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const options: SignOptions = { expiresIn: expiresIn as any };
  return jwt.sign(payload, secret, options);
};

// Verify JWT token
export const verifyToken = (token: string): any => {
  return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
};

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send OTP via email
export const sendOTPEmail = async (
  email: string, 
  otp: string, 
  username: string
): Promise<boolean> => {
  try {
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your 2FA Verification Code - MyBooksData',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Two-Factor Authentication</h2>
          <p>Hello ${username},</p>
          <p>Your verification code for login is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p><strong>This code will expire in 4 minutes.</strong></p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message from MyBooksData Security System.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
};

// Convert string to ObjectId
export const toObjectId = (id: string): Types.ObjectId => {
  return new Types.ObjectId(id);
};