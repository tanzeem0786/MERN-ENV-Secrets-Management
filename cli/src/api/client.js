import axios from 'axios';
import { buildCookieHeader, readSession } from '../auth/session.js';

export function getApiBaseUrl() {
  return process.env.MERNSECRETS_API_URL || 'http://localhost:4000/api';
}

function normalizeCookieHeader(setCookieHeader) {
  if (!setCookieHeader) {
    return '';
  }

  const headerValues = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  return headerValues.join('; ');
}

export function extractAccessToken(setCookieHeader) {
  const headerValue = normalizeCookieHeader(setCookieHeader);
  const match = headerValue.match(/accessToken=([^;]+)/i);

  if (!match) {
    return '';
  }

  return match[1];
}

export function createApiClient(session = readSession()) {
  const headers = session?.accessToken ? { Cookie: buildCookieHeader(session) } : {};

  return axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15000,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      ...headers,
    },
  });
}

export async function loginWithCredentials(email, password) {
  const client = createApiClient();
  const response = await client.post('/auth/login', { email, password });
  const accessToken = extractAccessToken(response.headers['set-cookie']);

  if (!accessToken) {
    throw new Error('Authentication succeeded but no session token was returned.');
  }

  return { email, accessToken };
}

export async function logoutWithSession(session = readSession()) {
  if (!session?.accessToken) {
    return false;
  }

  const client = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15000,
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      Cookie: buildCookieHeader(session),
    },
  });

  await client.post('/auth/logout');
  return true;
}
