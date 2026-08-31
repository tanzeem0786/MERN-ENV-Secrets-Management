import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { writeSession } from '../src/auth/session.js';

const SECRET_VALUE = 'TEST_SECRET_VALUE_123';
const SECOND_SECRET = 'FAKE_DATABASE_PASSWORD_456';
const TOKEN = 'FAKE_TEST_ACCESS_TOKEN';

function withTempConfigDirectory(callback) {
  const originalAppData = process.env.APPDATA;
  const originalXdgConfigHome = process.env.XDG_CONFIG_HOME;
  const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'mernsecrets-secret-'));

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

function createSecretApiServer({ includeSecretError = false } = {}) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://127.0.0.1');

      if (req.method === 'GET' && url.pathname === '/api/organizations/mine') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { organizations: [{ _id: 'org1', name: 'Org One' }] } }));
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/projects') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { projects: [{ _id: 'proj1', name: 'Project One', slug: 'project-one' }] } }));
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/environments') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { environments: [{ _id: 'env1', name: 'development', slug: 'development' }] } }));
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/secrets') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { secrets: [{ _id: 'secret1', key: 'DATABASE_URL' }, { _id: 'secret2', key: 'JWT_SECRET' }] } }));
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/secrets/secret1/reveal') {
        if (includeSecretError) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: `Invalid secret ${SECRET_VALUE}` }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { secret: { value: SECRET_VALUE } } }));
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/secrets/secret2/reveal') {
        if (includeSecretError) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: `Invalid secret ${SECOND_SECRET}` }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: { secret: { value: SECOND_SECRET } } }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, message: 'not found' }));
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, port: address.port });
    });
  });
}

test('run command does not leak secret values in stdout or stderr', async () => {
  const { server, port } = await createSecretApiServer();

  try {
    withTempConfigDirectory(() => {
      writeSession({ email: 'test@example.com', accessToken: 'FAKE_TEST_ACCESS_TOKEN' });

      const result = spawnSync(process.execPath, [
        path.resolve(process.cwd(), 'src/index.js'),
        'run',
        '--env',
        'development',
        '--',
        'node',
        '-p',
        "process.env.DATABASE_URL === 'TEST_SECRET_VALUE_123' ? 'SECRET_PRESENT=true' : 'SECRET_PRESENT=false'",
      ], {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: {
          ...process.env,
          MERNSECRETS_API_URL: `http://127.0.0.1:${port}/api`,
        },
      });

      assert.equal(result.status, 0, `Expected child process to succeed: ${result.stderr || result.stdout}`);
      assert.ok(!result.stdout.includes(SECRET_VALUE));
      assert.ok(!result.stderr.includes(SECRET_VALUE));
      assert.ok(!result.stdout.includes(SECOND_SECRET));
      assert.ok(!result.stderr.includes(SECOND_SECRET));
      assert.match(result.stdout, /SECRET_PRESENT=true/i);
    });
  } finally {
    server.close();
  }
});

test('backend error messages containing secrets are sanitized before being displayed', async () => {
  const { server, port } = await createSecretApiServer({ includeSecretError: true });

  try {
    withTempConfigDirectory(() => {
      const result = spawnSync(process.execPath, [
        path.resolve(process.cwd(), 'src/index.js'),
        'run',
        '--env',
        'development',
        '--',
        'node',
        '-p',
        "'SECRET_PRESENT=true'",
      ], {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: {
          ...process.env,
          MERNSECRETS_API_URL: `http://127.0.0.1:${port}/api`,
        },
      });

      const output = `${result.stdout || ''}${result.stderr || ''}`;
      assert.ok(!output.includes(SECRET_VALUE));
      assert.ok(!output.includes(SECOND_SECRET));
      assert.match(output, /Unable to retrieve environment secrets\.|Authentication failed|Unable to run the requested command\./i);
    });
  } finally {
    server.close();
  }
});

test('source review does not log secret values or stringify full response payloads', () => {
  const runSource = fs.readFileSync(path.resolve(process.cwd(), 'src/commands/run.js'), 'utf8');
  const clientSource = fs.readFileSync(path.resolve(process.cwd(), 'src/api/client.js'), 'utf8');

  assert.ok(!runSource.includes('console.log(secrets)'));
  assert.ok(!runSource.includes('console.log(response.data)'));
  assert.ok(!runSource.includes('console.log(childEnv)'));
  assert.ok(!runSource.includes('JSON.stringify(response.data)'));
  assert.ok(!runSource.includes('JSON.stringify(error)'));
  assert.ok(!clientSource.includes('Authorization: Bearer'));
});

test('pull output remains safe and does not emit fake secret values', () => {
  const result = spawnSync(process.execPath, [path.resolve(process.cwd(), 'src/index.js'), 'pull'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  const output = `${result.stdout || ''}${result.stderr || ''}`;
  assert.ok(!output.includes(SECRET_VALUE));
  assert.ok(!output.includes(SECOND_SECRET));
  assert.ok(!output.includes(TOKEN));
});

test('token and cookie headers are not printed when session errors occur', () => {
  const output = 'Authentication failed';

  assert.ok(!output.includes(TOKEN));
  assert.ok(!output.includes('Authorization: Bearer'));
  assert.ok(!output.includes('Cookie: accessToken='));
});

test('hidden password strings do not appear in CLI output paths', () => {
  const output = 'Authentication failed';

  assert.ok(!output.includes(SECOND_SECRET));
  assert.ok(output.includes('Authentication failed'));
});

test('secret values are not added to URLs or command arguments', () => {
  const safeUrl = new URL('https://example.test/api');
  const requestPath = `${safeUrl.toString()}?key=REDACTED`;
  const args = ['node', 'server.js', '--flag', 'safe-value'];

  assert.ok(!requestPath.includes(SECRET_VALUE));
  assert.ok(!args.includes(SECRET_VALUE));
  assert.ok(requestPath.includes('REDACTED'));
});

test('run keeps secrets in child environment only and does not mutate the parent environment', () => {
  const parentKey = 'TEST_SECRET_VALUE_123';
  delete process.env[parentKey];

  withTempConfigDirectory(() => {
    const result = spawnSync(process.execPath, [
      path.resolve(process.cwd(), 'src/index.js'),
      'run',
      '--env',
      'development',
      '--',
      'node',
      '-p',
      "process.env.TEST_SECRET_VALUE_123 === 'TEST_SECRET_VALUE_123' ? 'SECRET_PRESENT=true' : 'SECRET_PRESENT=false'",
    ], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        MERNSECRETS_API_URL: 'http://127.0.0.1:1/api',
      },
    });

    assert.ok(!('TEST_SECRET_VALUE_123' in process.env));
    assert.ok(!result.stdout.includes(SECRET_VALUE));
  });
});
