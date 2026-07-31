import { verifyToken } from '../../security/jwt.js';
import { getUserById } from './auth.service.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Authorization token missing');
    err.statusCode = 401;
    return next(err);
  }

  const token = authHeader.replace('Bearer ', '').trim();
  let payload;

  try {
    payload = verifyToken(token);
  } catch (error) {
    const err = new Error('Invalid or expired token');
    err.statusCode = 401;
    return next(err);
  }

  const user = await getUserById(payload.userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 401;
    return next(err);
  }

  const safeUser = user.toObject();
  delete safeUser.password;

  req.user = safeUser;
  next();
};
