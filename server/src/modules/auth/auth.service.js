import User from '../../models/User.js';
import { hashPassword, comparePassword } from '../../security/password.js';
import { signToken } from '../../security/jwt.js';

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await hashPassword(password);
  const user = await User.create({ name, email, password: hashed });

  const token = signToken({ userId: user._id.toString() });

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ userId: user._id.toString() });

  return { user, token };
};

export const getUserById = async (id) => {
  return User.findById(id);
};
