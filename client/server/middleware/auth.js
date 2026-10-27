import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';
import { User } from '../models/User.js';

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Access token is missing');
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Attach decoded token payload to req.user
    const user = await User.findById(decoded.userId).select('-passwordHash');
    if (!user) {
      throw new UnauthorizedError('User account associated with this token no longer exists');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    User.findById(decoded.userId)
      .select('-passwordHash')
      .then(user => {
        if (user) req.user = user;
        next();
      })
      .catch(() => next());
  } catch {
    next();
  }
}
