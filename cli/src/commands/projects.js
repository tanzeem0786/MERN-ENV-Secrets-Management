import { Command } from 'commander';
import { listProjects } from '../api/client.js';

export function createProjectsCommand() {
  const command = new Command('projects');

  command
    .description('List projects available to the authenticated user.')
    .action(async () => {
      try {
        const projects = await listProjects();

        if (!projects.length) {
          console.log('No projects found.');
          return;
        }

        console.log('Projects');
        console.log('');

        for (const project of projects) {
          console.log(project.name || project.slug || project._id || project.id);
        }
      } catch (error) {
        const status = error?.response?.status;

        if (error?.message?.includes('not authenticated')) {
          console.error('✗ You are not authenticated.\nPlease run: mernsecrets login');
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

        console.error('✗ Unable to load projects right now.');
        process.exitCode = 1;
      }
    });

  return command;
}
