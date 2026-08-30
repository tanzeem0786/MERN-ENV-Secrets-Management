#!/usr/bin/env node

import { Command } from 'commander';
import { createLoginCommand } from './commands/login.js';
import { createLogoutCommand } from './commands/logout.js';
import { createProjectsCommand } from './commands/projects.js';
import { createEnvCommand } from './commands/env.js';
import { createPullCommand } from './commands/pull.js';
import { createRunCommand } from './commands/run.js';

const program = new Command();

program
  .name('mernsecrets')
  .description('MERNSecrets command-line interface')
  .version('0.1.0', '-v, --version', 'Output the current version number')
  .helpOption('-h, --help', 'Display help information')
  .addHelpCommand(false);

program.addCommand(createLoginCommand());
program.addCommand(createLogoutCommand());
program.addCommand(createProjectsCommand());
program.addCommand(createEnvCommand());
program.addCommand(createPullCommand());
program.addCommand(createRunCommand());

program.parse(process.argv);
