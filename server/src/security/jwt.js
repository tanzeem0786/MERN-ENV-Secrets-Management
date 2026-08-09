import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (payload) => {
  // payload should be a small object, e.g. { userId }
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

export const verifyToken = (accessToken) => {
  return jwt.verify(accessToken, env.JWT_SECRET);
};
