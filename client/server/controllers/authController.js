import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { config } from '../config/env.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/authValidators.js';
import { ValidationError, UnauthorizedError, ConflictError } from '../utils/errors.js';

function generateToken(userId) {
  return jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export async function register(req, res, next) {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      throw new ConflictError('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      user: user.toSafeObject(),
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await user.comparePassword(validatedData.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      message: 'Signed in successfully',
      user: user.toSafeObject(),
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.status(200).json({
    success: true,
    message: 'Signed out successfully',
  });
}

export async function updateProfile(req, res, next) {
  try {
    const validatedData = updateProfileSchema.parse(req.body);
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (validatedData.name) {
      user.name = validatedData.name;
    }

    if (validatedData.newPassword) {
      if (!validatedData.currentPassword) {
        throw new ValidationError('Current password is required to set a new password');
      }
      const isMatch = await user.comparePassword(validatedData.currentPassword);
      if (!isMatch) {
        throw new ValidationError('Current password is incorrect');
      }
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(validatedData.newPassword, salt);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}
