import crypto from 'node:crypto';

process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/mernsecrets-test-never-use';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
process.env.JWT_EXPIRES_IN = '1h';
process.env.SECRET_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');
