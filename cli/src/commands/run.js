import { spawn } from 'node:child_process';
import { Command } from 'commander';
import { createApiClient, listProjects, revealSecret } from '../api/client.js';
import { readSession } from '../auth/session.js';

const VALID_ENV_VAR_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

const redactError = (message) => {
  if (!message) {
    return '✗ Unable to run the requested command.';
  }

  if (message.includes('accessToken') || message.includes('Cookie') || message.includes('password')) {
    return '✗ Unable to run the requested command.';
  }

  return message;
};

function printMissingCommandUsage() {
  console.error('✗ No command specified.');
  console.error('');
  console.error('Usage:');
  console.error('mernsecrets run --env <environment> -- <command> [args...]');
}

function createChildEnv(secretValues) {
  const secretEnvironment = {};

  for (const [key, value] of Object.entries(secretValues)) {
    if (!VALID_ENV_VAR_NAME.test(key)) {
      throw new Error('INVALID_ENV_KEY');
    }

    if (Object.prototype.hasOwnProperty.call(secretEnvironment, key)) {
      throw new Error(`DUPLICATE_ENV_KEY:${key}`);
    }

    secretEnvironment[key] = value;
  }

  return {
    ...process.env,
    ...secretEnvironment,
  };
}

export function createRunCommand() {
  const command = new Command('run');

  command
    .description('Run a child process with environment variables from a MERNSecrets environment.')
    .option('--env <environment>', 'Environment name, slug, or ID to inject into the child process')
    .allowUnknownOption(true)
    .allowExcessArguments(true);

  command.action(async (options, commandInstance) => {
    const environmentName = options?.env;
    const childArgs = Array.isArray(commandInstance?.args) ? commandInstance.args : [];
    const separatorIndex = process.argv.indexOf('--');
    const trailingArgs = separatorIndex >= 0 ? process.argv.slice(separatorIndex + 1) : childArgs;
    const [childCommand, ...remainingArgs] = trailingArgs;

    if (!environmentName) {
      console.error('✗ Missing environment name.');
      console.error('');
      console.error('Usage:');
      console.error('mernsecrets run --env <environment> -- <command> [args...]');
      process.exitCode = 1;
      return;
    }

    if (!childCommand) {
      printMissingCommandUsage();
      process.exitCode = 1;
      return;
    }

    try {
      const session = readSession();
      if (!session?.accessToken) {
        console.error('✗ You are not authenticated.\nPlease run: mernsecrets login');
        process.exitCode = 1;
        return;
      }

      const projectList = await listProjects();
      let selectedEnvironment = null;

      for (const project of projectList) {
        const projectId = project?._id || project?.id;
        if (!projectId) {
          continue;
        }

        const client = createApiClient(session);
        const response = await client.get('/environments', {
          params: { projectId },
        });

        const environments = response?.data?.data?.environments ?? [];
        const environment = environments.find((candidate) => {
          const candidateId = candidate?._id || candidate?.id;
          return [candidate?.name, candidate?.slug, candidateId].includes(environmentName);
        });

        if (environment) {
          selectedEnvironment = environment;
          break;
        }
      }

      if (!selectedEnvironment) {
        throw new Error(`Environment "${environmentName}" was not found.`);
      }

      const secrets = await createApiClient(session).get('/secrets', {
        params: { environmentId: selectedEnvironment._id || selectedEnvironment.id },
      });

      const secretRows = secrets?.data?.data?.secrets ?? [];
      const secretValues = {};
      const seenKeys = new Set();

      for (const secret of secretRows) {
        const secretId = secret?._id || secret?.id;
        const secretKey = secret?.key;

        if (!secretId || !secretKey) {
          continue;
        }

        if (!VALID_ENV_VAR_NAME.test(secretKey)) {
          console.error('✗ Invalid environment variable name received from server.');
          process.exitCode = 1;
          return;
        }

        if (seenKeys.has(secretKey)) {
          console.error(`✗ Duplicate environment variable detected: ${secretKey}`);
          process.exitCode = 1;
          return;
        }

        seenKeys.add(secretKey);

        const revealedSecret = await revealSecret(secretId);
        if (!revealedSecret || typeof revealedSecret.value === 'undefined') {
          throw new Error('Secret could not be revealed.');
        }

        secretValues[secretKey] = revealedSecret.value;
      }

      const childEnv = createChildEnv(secretValues);
      const child = spawn(childCommand, remainingArgs, {
        cwd: process.cwd(),
        env: childEnv,
        stdio: 'inherit',
        shell: false,
      });

      const forwardSignal = (signalName) => {
        if (child.exitCode === null && !child.killed) {
          child.kill(signalName);
        }
      };

      const handleSigint = () => forwardSignal('SIGINT');
      const handleSigterm = () => forwardSignal('SIGTERM');

      process.on('SIGINT', handleSigint);
      process.on('SIGTERM', handleSigterm);

      child.on('error', (error) => {
        console.error(`✗ Failed to start command: ${error.message}`);
        process.exitCode = 1;
      });

      child.on('exit', (code, signal) => {
        process.off('SIGINT', handleSigint);
        process.off('SIGTERM', handleSigterm);

        if (signal) {
          process.exit(1);
          return;
        }

        process.exit(code ?? 0);
      });
    } catch (error) {
      const message = redactError(error?.message || 'Unable to run the requested command.');

      if (error?.message === 'INVALID_ENV_KEY') {
        console.error('✗ Invalid environment variable name received from server.');
        process.exitCode = 1;
        return;
      }

      if (error?.message?.startsWith('DUPLICATE_ENV_KEY:')) {
        const duplicateKey = error.message.split(':')[1];
        console.error(`✗ Duplicate environment variable detected: ${duplicateKey}`);
        process.exitCode = 1;
        return;
      }

      if (error?.message?.includes('not authenticated')) {
        console.error('✗ You are not authenticated.\nPlease run: mernsecrets login');
        process.exitCode = 1;
        return;
      }

      if (error?.message?.includes('was not found')) {
        console.error(message);
        process.exitCode = 1;
        return;
      }

      if (error?.response?.status === 401) {
        console.error('✗ Your MERNSecrets session has expired.\nPlease run: mernsecrets login');
        process.exitCode = 1;
        return;
      }

      if (error?.response?.status === 403) {
        console.error('✗ Access denied.');
        process.exitCode = 1;
        return;
      }

      if (error?.code === 'ECONNREFUSED' || error?.message?.includes('ECONNREFUSED')) {
        console.error('✗ The MERNSecrets service is unavailable right now.');
        process.exitCode = 1;
        return;
      }

      console.error(message);
      process.exitCode = 1;
    }
  });

  return command;
}
