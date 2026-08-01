import { registerUser, loginUser, logoutUser } from './auth.service.js';

export const registerController = async (req, res) => {
  const { user, token } = await registerUser(req.body);
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user, token },
  });
};

export const loginController = async (req, res) => {
  const { user, token } = await loginUser(req.body);
  res.json({
    success: true,
    message: 'Login successful',
    data: { user, token },
  });
};

export const logoutController = async (req, res) => {
  if (req.user) {
    await logoutUser(req.user._id, req);
  }

  res.json({
    success: true,
    message: 'Logout successful. Discard the token on the client to complete logout.',
  });
};

export const meController = async (req, res) => {
  res.json({
    success: true,
    message: 'Current user retrieved successfully',
    data: { user: req.user },
  });
};
