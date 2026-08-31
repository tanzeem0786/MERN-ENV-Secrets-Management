import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { createApiClient, getAuthenticatedSession } from '../src/api/client.js';
import { buildCookieHeader, clearSession, getSessionFilePath, readSession, writeSession } from '../src/auth/session.js';
import { getConfigDirectory } from '../src/config/paths.js';

const TEST_EMAIL = 'test@example.com';
const TEST_TOKEN = 'FAKE_TEST_ACCESS_TOKEN';
const TEST_PASSWORD = 'FAKE_PASSWORD';

function withTempConfigDirectory(callback) {
  const originalAppData = process.env.APPDATA;
  const originalXdgConfigHome = process.env.XDG_CONFIG_HOME;
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'mernsecrets-session-'));

  if (process.platform === 'win32') {
    process.env.APPDATA = tempDirectory;
    delete process.env.XDG_CONFIG_HOME;
  } else {
    process.env.XDG_CONFIG_HOME = tempDirectory;
    delete process.env.APPDATA;
  }

  try {
    callback(tempDirectory);
  } finally {
    if (typeof originalAppData === 'undefined') {
      delete process.env.APPDATA;
    } else {
      process.env.APPDATA = originalAppData;
    }

    if (typeof originalXdgConfigHome === 'undefined') {
      delete process.env.XDG_CONFIG_HOME;
    } else {
      process.env.XDG_CONFIG_HOME = originalXdgConfigHome;
    }

    fs.rmSync(tempDirectory, { recursive: true, force: true });
  }
}

test('readSession returns null when no session exists', () => {
  withTempConfigDirectory(() => {
    assert.equal(readSession(), null);
  });
});

test('readSession loads a valid session file', () => {
  withTempConfigDirectory(() => {
    const session = { email: TEST_EMAIL, accessToken: TEST_TOKEN };
    writeSession(session);

    const loadedSession = readSession();
    assert.deepEqual(loadedSession, session);
  });
});

test('writeSession does not persist a password value', () => {
  withTempConfigDirectory(() => {
    const session = {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      accessToken: TEST_TOKEN,
    };

    writeSession(session);
    const sessionPath = getSessionFilePath();
    const raw = fs.readFileSync(sessionPath, 'utf8');

    assert.ok(!raw.includes('password'));
    assert.ok(!raw.includes(TEST_PASSWORD));
    assert.equal(readSession()?.accessToken, TEST_TOKEN);
  });
});

test('session files are stored outside the CLI repository directory', () => {
  withTempConfigDirectory(() => {
    const sessionPath = getSessionFilePath();
    const cliRoot = path.resolve(process.cwd());

    assert.ok(!sessionPath.startsWith(cliRoot), 'Session storage must live outside the repository CLI directory');
    assert.ok(!sessionPath.includes(path.join('cli', 'session.json')));
  });
});

test('session file uses restrictive permissions on Unix-like systems', () => {
  withTempConfigDirectory(() => {
    writeSession({ email: TEST_EMAIL, accessToken: TEST_TOKEN });
    const sessionPath = getSessionFilePath();

    if (process.platform === 'win32') {
      return;
    }

    const stats = fs.statSync(sessionPath);
    assert.equal(stats.mode & 0o777, 0o600);
  });
});

test('corrupted or malformed session data is handled safely', () => {
  withTempConfigDirectory(() => {
    const sessionPath = getSessionFilePath();
    fs.mkdirSync(path.dirname(sessionPath), { recursive: true, mode: 0o700 });
    fs.writeFileSync(sessionPath, '{invalid json', 'utf8');

    assert.equal(readSession(), null);
    assert.ok(!sessionPath.includes(TEST_TOKEN));
  });
});

test('session without accessToken is treated as unauthenticated', () => {
  withTempConfigDirectory(() => {
    writeSession({ email: TEST_EMAIL });
    assert.equal(readSession(), null);
    assert.equal(buildCookieHeader({ email: TEST_EMAIL }), '');
  });
});

test('invalid session handling does not expose the fake token in user-facing errors', () => {
  withTempConfigDirectory(() => {
    try {
      getAuthenticatedSession();
      assert.fail('Expected getAuthenticatedSession() to throw when no session exists');
    } catch (error) {
      assert.match(error.message, /not authenticated|run "mernsecrets login"/i);
      assert.ok(!error.message.includes(TEST_TOKEN));
    }
  });
});

test('buildCookieHeader returns the cookie contract used by the API client', () => {
  const cookie = buildCookieHeader({ email: TEST_EMAIL, accessToken: TEST_TOKEN });

  assert.equal(cookie, `accessToken=${TEST_TOKEN}`);
  assert.ok(!cookie.includes('Authorization'));
  assert.ok(!cookie.includes('Bearer'));
});

test('API client uses Cookie auth and does not set a bearer Authorization header', () => {
  const client = createApiClient({ email: TEST_EMAIL, accessToken: TEST_TOKEN });

  assert.equal(client.defaults.headers.Cookie, `accessToken=${TEST_TOKEN}`);
  assert.equal(client.defaults.headers.Authorization, undefined);
});

test('clearSession removes the current user session file', () => {
  withTempConfigDirectory(() => {
    writeSession({ email: TEST_EMAIL, accessToken: TEST_TOKEN });
    const sessionPath = getSessionFilePath();

    assert.ok(fs.existsSync(sessionPath));
    clearSession();
    assert.ok(!fs.existsSync(sessionPath));
  });
});
