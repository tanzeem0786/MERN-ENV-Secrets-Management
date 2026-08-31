import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const cliEntry = path.resolve(process.cwd(), 'src/index.js');

test('CLI entry point provides help output successfully', () => {
  const result = spawnSync(process.execPath, [cliEntry, '--help'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, `CLI help exited with status ${result.status}: ${result.stderr || result.stdout}`);
  assert.match(result.stdout, /mernsecrets/i, 'Help output should contain the CLI name');
  assert.match(result.stdout, /usage:/i, 'Help output should contain usage text');
});
