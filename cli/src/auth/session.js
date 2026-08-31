import fs from 'node:fs';
import path from 'node:path';
import { ensureSecureFilePermissions, getConfigDirectory } from '../config/paths.js';

function sanitizeSession(session) {
  if (!session || typeof session !== 'object') {
    return null;
  }

  const sanitizedSession = { ...session };
  delete sanitizedSession.password;

  return sanitizedSession;
}

export function getSessionFilePath() {
  return path.join(getConfigDirectory(), 'session.json');
}

export function readSession() {
  const sessionPath = getSessionFilePath();

  if (!fs.existsSync(sessionPath)) {
    return null;
  }

  try {
    const rawSession = fs.readFileSync(sessionPath, 'utf8');
    const parsedSession = sanitizeSession(JSON.parse(rawSession));

    if (!parsedSession?.accessToken) {
      return null;
    }

    return parsedSession;
  } catch {
    return null;
  }
}

export function writeSession(session) {
  const sessionPath = getSessionFilePath();
  const directory = path.dirname(sessionPath);
  const sanitizedSession = sanitizeSession(session);

  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  fs.writeFileSync(sessionPath, JSON.stringify(sanitizedSession ?? {}, null, 2), {
    mode: 0o600,
  });
  ensureSecureFilePermissions(sessionPath);
}

export function clearSession() {
  const sessionPath = getSessionFilePath();

  if (fs.existsSync(sessionPath)) {
    fs.unlinkSync(sessionPath);
  }
}

export function buildCookieHeader(session) {
  if (!session?.accessToken) {
    return '';
  }

  return `accessToken=${session.accessToken}`;
}
