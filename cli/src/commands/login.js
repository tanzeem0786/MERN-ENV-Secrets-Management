import { Command } from 'commander';

export function createLoginCommand() {
  const command = new Command('login');

  command
    .description('Authenticate with MERNSecrets. This command is not implemented yet.')
    .option('-u, --username <username>', 'Username or email address to use for future authentication flow')
    .action(() => {
      console.log('MERNSecrets login is planned for a later milestone.');
    });

  return command;
}
