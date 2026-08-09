import ErrorHandler from '../../middleware/errorHandler.js';
import { verifyToken } from '../../security/jwt.js';
import { getUserById } from './auth.service.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.cookie || ''
  const accessToken = authHeader.replace('accessToken=', '').trim() || '';
  
  if(!accessToken) {
   return res.status(401).json({
      success: false,
      message: "Authorization Token Missing!"
    })
  }

  let payload;
  try {
    payload = verifyToken(accessToken);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid or Expired Token!",
    });
  }

  const user = await getUserById(payload.userId);
  if (!user) {
    return next(new ErrorHandler("User Not Found!", 404));
  }

  const safeUser = user.toObject();
  delete safeUser.password;

  req.user = safeUser;
  next();
};
