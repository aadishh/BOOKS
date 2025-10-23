"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toObjectId = exports.sendOTPEmail = exports.verifyToken = exports.generateToken = exports.generateOTP = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const mongoose_1 = require("mongoose");
const generateOTP = () => {
    return crypto_1.default.randomInt(100000, 999999).toString();
};
exports.generateOTP = generateOTP;
const generateToken = (payload, expiresIn = '24h') => {
    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const options = { expiresIn: expiresIn };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
};
exports.verifyToken = verifyToken;
const createEmailTransporter = () => {
    return nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};
const sendOTPEmail = async (email, otp, username) => {
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
    }
    catch (error) {
        console.error('Failed to send OTP email:', error);
        return false;
    }
};
exports.sendOTPEmail = sendOTPEmail;
const toObjectId = (id) => {
    return new mongoose_1.Types.ObjectId(id);
};
exports.toObjectId = toObjectId;
//# sourceMappingURL=auth.js.map