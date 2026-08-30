import { Command } from 'commander';

export function createPullCommand() {
  const command = new Command('pull');

  command
    .description('Pull resources from MERNSecrets. This command is not implemented yet.')
    .action(() => {
      console.log('Pull support is planned for a later milestone.');
    });

  return command;
}
