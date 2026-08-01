import crypto from 'crypto';
import { env } from '../config/env.js';

// SECRET_ENCRYPTION_KEY expected to be base64-encoded 32 bytes (AES-256)
const RAW_KEY = (() => {
  try {
    const buf = Buffer.from(env.SECRET_ENCRYPTION_KEY, 'base64');
    if (buf.length !== 32) {
      throw new Error(`SECRET_ENCRYPTION_KEY must decode to 32 bytes (got ${buf.length})`);
    }
    return buf;
  } catch (err) {
    throw new Error(`Invalid SECRET_ENCRYPTION_KEY: ${err.message}`);
  }
})();

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM

export const encrypt = (plaintext) => {
  if (typeof plaintext !== 'string') {
    throw new Error('encrypt() expects a string');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, RAW_KEY, iv, { authTagLength: 16 });

  const encrypted = Buffer.concat([cipher.update(Buffer.from(plaintext, 'utf8')), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedValue: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
};

export const decrypt = (encryptedValue, iv, authTag) => {
  if (!encryptedValue || !iv || !authTag) {
    throw new Error('Missing encryption parameters');
  }

  const encBuf = Buffer.from(encryptedValue, 'base64');
  const ivBuf = Buffer.from(iv, 'base64');
  const authBuf = Buffer.from(authTag, 'base64');

  const decipher = crypto.createDecipheriv(ALGO, RAW_KEY, ivBuf, { authTagLength: 16 });
  decipher.setAuthTag(authBuf);

  const decrypted = Buffer.concat([decipher.update(encBuf), decipher.final()]);
  return decrypted.toString('utf8');
};
