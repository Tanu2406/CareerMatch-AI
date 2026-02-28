import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // duplicate email - conflict status per requirements
      return res.status(409).json({
        message: 'Email already registered. Please login instead.'
      });
    }

    // Create user (no auto-login, redirect to login page)
    const user = await User.create({
      name,
      email,
      password
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please login.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    // User not found - return 404
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User does not exist',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
        code: 'INVALID_PASSWORD'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Verify OTP that was generated previously
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpire +otpVerified');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (!user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.otpVerified = true;
    // keep otp/expire until password has been reset; clearing happens on success
    await user.save({ validateBeforeSave: false });

    return res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// @desc    Generate OTP for password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // not revealing existence
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.otpVerified = false;

    await user.save({ validateBeforeSave: false });

    // send OTP via email
    try {
      const transportOpts = {};
      if (process.env.EMAIL_SERVICE) {
        transportOpts.service = process.env.EMAIL_SERVICE;
      } else {
        transportOpts.host = process.env.EMAIL_HOST || 'smtp.gmail.com';
        transportOpts.port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587;
        transportOpts.secure = process.env.EMAIL_SECURE === 'true';
      }
      transportOpts.auth = {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      };

      const transporter = nodemailer.createTransport(transportOpts);
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: user.email,
        subject: 'Your CareerMatch AI Password Reset OTP',
        text: `Your password reset code is: ${otp} (expires in 10 minutes)`
      });
    } catch (mailErr) {
      console.error('Error sending OTP email:', mailErr);
      return res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }

    return res.status(200).json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// @desc    Reset user password after OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP and new password required' });
    }

    const user = await User.findOne({ email }).select('+password +otp +otpExpire +otpVerified');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otpVerified) {
      return res.status(400).json({ success: false, message: 'OTP has not been verified' });
    }

    if (user.otp !== otp || !user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    user.otpVerified = false;

    await user.save();

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Error resetting password', error: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};
