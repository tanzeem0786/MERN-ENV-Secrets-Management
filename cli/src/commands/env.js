import { Command } from 'commander';
import { listEnvironmentsForProject } from '../api/client.js';

export function createEnvCommand() {
  const command = new Command('env');

  command.description('List environments for a project.');

  const listCommand = new Command('list');
  listCommand
    .description('List environments for the selected project.')
    .requiredOption('-p, --project <project>', 'Project name, slug, or ID')
    .action(async (options) => {
      const projectName = options.project;

      try {
        const { project, environments } = await listEnvironmentsForProject(projectName);

        console.log(`Project: ${project.name || project.slug || project._id || project.id}`);
        console.log('');
        console.log('Environments');
        console.log('');

        if (!environments.length) {
          console.log('No environments found for this project.');
          return;
        }

        for (const environment of environments) {
          console.log(environment.name || environment.slug || environment._id || environment.id);
        }
      } catch (error) {
        const status = error?.response?.status;

        if (error?.message?.includes('not authenticated')) {
          console.error('✗ You are not authenticated.\nPlease run: mernsecrets login');
          process.exitCode = 1;
          return;
        }

        if (error?.message?.includes('was not found')) {
          console.error(`✗ Project "${projectName}" was not found.`);
          process.exitCode = 1;
          return;
        }

        if (status === 401) {
          console.error('✗ Your MERNSecrets session has expired.\nPlease run: mernsecrets login');
          process.exitCode = 1;
          return;
        }

        if (status === 403) {
          console.error('✗ Access denied.');
          process.exitCode = 1;
          return;
        }

        if (status === 404) {
          console.error('✗ Project or environment data was not found.');
          process.exitCode = 1;
          return;
        }

        if (status === 429) {
          console.error('✗ Rate limited. Please try again shortly.');
          process.exitCode = 1;
          return;
        }

        if (status >= 500) {
          console.error('✗ The MERNSecrets service is unavailable right now.');
          process.exitCode = 1;
          return;
        }

        console.error('✗ Unable to load environments right now.');
        process.exitCode = 1;
      }
    });

  command.addCommand(listCommand);
  command.action(() => {
    command.help();
  });

  return command;
}
