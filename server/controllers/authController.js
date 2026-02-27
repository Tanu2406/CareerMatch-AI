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

// @desc    Send forgot password token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide email' });
    }

    const user = await User.findOne({ email });

    // generate token and attempt send regardless of user existence; we always return 200
    let resetToken;
    if (user) {
      resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });
    }

    const resetUrl = `${process.env.CLIENT_URL || ''}/reset-password?token=${resetToken}`;
    console.log('Password reset link:', resetUrl);

    // prepare transporter options
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

    let mailError = null;
    try {
      console.log('Preparing to send reset email to:', email);
      console.log('Transport options:', transportOpts);

      const transporter = nodemailer.createTransport(transportOpts);

      // verify connection configuration
      transporter.verify((err, success) => {
        if (err) {
          console.error('Transporter verification failed:', err);
        } else {
          console.log('Transporter verified successfully');
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset - CareerMatch AI',
        text: `You requested a password reset. Use the link: ${resetUrl}`,
        html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`
      };

      console.log('Sending email...');
      const info = await transporter.sendMail(mailOptions);
      console.log('Reset email sent:', info && (info.messageId || info.response));
    } catch (emailErr) {
      mailError = emailErr;
      console.error('Error sending reset email:', emailErr);
    }

    if (mailError) {
      return res.status(500).json({ message: 'Email failed to send', error: mailError.message });
    }

    // success response (even if user was not found we pretend to send)
    return res.status(200).json({ message: 'Reset link sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Reset user password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password required' });
    }

    const crypto = require('crypto');
    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Error resetting password' });
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
