import { Command } from 'commander';

export function createLogoutCommand() {
  const command = new Command('logout');

  command
    .description('End the current CLI session. This command is not implemented yet.')
    .action(() => {
      console.log('MERNSecrets logout is planned for a later milestone.');
    });

  return command;
}
