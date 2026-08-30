import { Command } from 'commander';

export function createRunCommand() {
  const command = new Command('run');

  command
    .description('Execute a MERNSecrets runtime workflow. This command is not implemented yet.')
    .argument('[target]', 'Target workflow or script to run')
    .action((target) => {
      console.log(`Run command placeholder: ${target || 'no target supplied'}`);
    });

  return command;
}
