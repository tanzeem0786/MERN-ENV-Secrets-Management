import ErrorHandler from '../../middleware/errorHandler.js';
import { verifyToken } from '../../security/jwt.js';
import { getUserById } from './auth.service.js';

export const authenticate = async (req, res, next) => {
  try {
    const cookies = (req.headers.cookie || '').split(';').reduce((result, cookie) => {
      const [name, ...value] = cookie.trim().split('=');
      if (name) result[name] = value.join('=');
      return result;
    }, {});
    const accessToken = cookies.accessToken || '';
  
    if (!accessToken) {
      return res.status(401).json({
      success: false,
        message: 'Authorization required',
      });
    }

    let payload;
    try {
      payload = verifyToken(accessToken);
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = await getUserById(payload.userId);
    if (!user) return next(new ErrorHandler('User not found', 404));

    const safeUser = user.toObject();
    delete safeUser.password;

    req.user = safeUser;
    return next();
  } catch (error) {
    return next(error);
  }
};
