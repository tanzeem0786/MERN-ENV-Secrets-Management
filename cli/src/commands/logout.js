import { Command } from 'commander';
import { logoutWithSession } from '../api/client.js';
import { clearSession, readSession } from '../auth/session.js';

export function createLogoutCommand() {
  const command = new Command('logout');

  command
    .description('Log out and remove the local CLI session.')
    .action(async () => {
      try {
        const session = readSession();

        if (!session?.accessToken) {
          console.log('✓ No active CLI session found.');
          return;
        }

        await logoutWithSession(session);
        clearSession();
        console.log('✓ Logged out successfully');
      } catch {
        clearSession();
        console.log('✓ Logged out successfully');
      }
    });

  return command;
}
