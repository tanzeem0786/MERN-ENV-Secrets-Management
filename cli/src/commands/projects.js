import { Command } from 'commander';

export function createProjectsCommand() {
  const command = new Command('projects');

  command
    .description('Inspect or list project resources. This command is not implemented yet.')
    .option('-l, --list', 'List available projects')
    .action((options) => {
      if (options.list) {
        console.log('Project listing is planned for a later milestone.');
        return;
      }

      console.log('Project commands are planned for a later milestone.');
    });

  return command;
}
