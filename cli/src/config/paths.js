import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function getConfigDirectory() {
  const homeDir = os.homedir();
  let baseDirectory;

  if (process.platform === 'win32') {
    baseDirectory = process.env.APPDATA || path.join(homeDir, 'AppData', 'Roaming');
  } else if (process.platform === 'darwin') {
    baseDirectory = path.join(homeDir, 'Library', 'Application Support');
  } else {
    baseDirectory = process.env.XDG_CONFIG_HOME || path.join(homeDir, '.config');
  }

  const configDirectory = path.join(baseDirectory, 'mernsecrets');
  fs.mkdirSync(configDirectory, { recursive: true, mode: 0o700 });

  return configDirectory;
}

export function ensureSecureFilePermissions(filePath) {
  if (process.platform !== 'win32') {
    try {
      fs.chmodSync(filePath, 0o600);
    } catch {
      // Ignore permission errors if the platform or filesystem blocks chmod.
    }
  }
}
