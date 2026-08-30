import readline from 'node:readline';
import { Command } from 'commander';
import { loginWithCredentials } from '../api/client.js';
import { clearSession, readSession, writeSession } from '../auth/session.js';

async function promptText(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await rl.question(`${message}: `);
  rl.close();
  return answer.trim();
}

async function promptHidden(message) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
      reject(new Error('Interactive password input is unavailable in this environment.'));
      return;
    }

    process.stdout.write(`${message}: `);
    let value = '';

    const onData = (chunk) => {
      const input = chunk.toString();

      for (const char of input) {
        if (char === '\r' || char === '\n') {
          process.stdin.removeListener('data', onData);
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(value);
          return;
        }

        if (char === '\u0003') {
          process.stdin.removeListener('data', onData);
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          reject(new Error('Login cancelled.'));
          return;
        }

        if (char === '\b' || char === '\u007f') {
          if (value.length > 0) {
            value = value.slice(0, -1);
          }
          continue;
        }

        value += char;
        process.stdout.write('*');
      }
    };

    process.stdin.resume();
    process.stdin.setRawMode(true);
    process.stdin.on('data', onData);
  });
}

export function createLoginCommand() {
  const command = new Command('login');

  command
    .description('Authenticate the CLI with the MERNSecrets API.')
    .action(async () => {
      try {
        const existingSession = readSession();

        if (existingSession?.accessToken) {
          console.log(`✓ Already authenticated as ${existingSession.email}`);
          return;
        }

        const email = await promptText('Email');
        const password = await promptHidden('Password');

        if (!email || !password) {
          console.error('✗ Authentication failed.\nCheck your credentials and try again.');
          process.exitCode = 1;
          return;
        }

        const session = await loginWithCredentials(email, password);
        writeSession(session);
        console.log(`✓ Successfully authenticated as ${session.email}`);
      } catch (error) {
        if (error?.message === 'Login cancelled.') {
          console.error('✗ Login cancelled.');
          process.exitCode = 1;
          return;
        }

        const statusCode = error?.response?.status;
        const message = statusCode === 401 || statusCode === 403
          ? '✗ Authentication failed.\nCheck your credentials and try again.'
          : '✗ Unable to authenticate right now. Please try again.';

        clearSession();
        console.error(message);
        process.exitCode = 1;
      }
    });

  return command;
}
