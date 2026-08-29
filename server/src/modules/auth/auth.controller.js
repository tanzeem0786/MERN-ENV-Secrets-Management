import { registerUser, loginUser, logoutUser } from './auth.service.js';
import { env } from '../../config/env.js';

export const registerController = async (req, res) => {
  const { user } = await registerUser(req.body);
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user },
  });
};

export const loginController = async (req, res) => {
  const { user, token } = await loginUser(req.body);
  res.status(200).cookie('accessToken', token, {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 1000 * 60 * 60, // 1 hour
}).json({
    success: true,
    message: 'Login successful',
    data: { user },
  });
};

export const logoutController = async (req, res) => {
  if (req.user) {
    await logoutUser(req.user._id, req);
  }
  res.status(200).clearCookie('accessToken', { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'strict' }).json({
    success: true,
    message: 'Logout successful',
  });
};

export const meController = async (req, res) => {
  res.json({
    success: true,
    message: 'Current user retrieved successfully',
    data: { user: req.user },
  });
};
