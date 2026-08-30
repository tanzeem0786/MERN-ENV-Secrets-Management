import { Command } from 'commander';

export function createEnvCommand() {
  const command = new Command('env');

  command
    .description('Manage environment contexts. This command is not implemented yet.')
    .option('-l, --list', 'List available environments')
    .action((options) => {
      if (options.list) {
        console.log('Environment listing is planned for a later milestone.');
        return;
      }

      console.log('Environment commands are planned for a later milestone.');
    });

  return command;
}
