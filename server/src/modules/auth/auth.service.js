import User from '../../models/User.js';
import { hashPassword, comparePassword } from '../../security/password.js';
import { signToken } from '../../security/jwt.js';
import { logActivity } from '../audit/audit.service.js';
import ErrorHandler from '../../middleware/errorHandler.js';

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    return next(new ErrorHandler("Email Already in Use!", 409));
  }

  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed });

  const token = signToken({ userId: user._id.toString() });

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler('Invalid email or password', 401));
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
   return next(new ErrorHandler('Invalid email or password', 401));
  }

  const token = signToken({ userId: user._id.toString() });

  await logActivity({
    userId: user._id,
    action: 'LOGIN',
    resourceType: 'auth',
    resourceName: 'login',
    status: 'success',
    metadata: { email },
  });

  return { user, token };
};

export const getUserById = async (id) => {
  return User.findById(id);
};

export const logoutUser = async (userId, req) => {
    await logActivity({
    userId,
    action: 'LOGOUT',
    resourceType: 'auth',
    resourceName: 'logout',
    status: 'success',
    ipAddress: req?.ip || '',
    userAgent: req?.get?.('user-agent') || '',
  });
};
