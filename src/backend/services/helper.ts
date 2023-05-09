import { spawn } from 'child_process';
import { File, Files } from 'formidable';
import { existsSync, mkdirSync, readdir, unlink } from 'fs';
import path from 'path';

const getCondaPath = () =>
  path.join(process.env.MINICONDA_PATH as string, 'condabin');

const getCondaCommand = () => `"${path.join(getCondaPath(), 'conda.bat')}"`;

const getActivateCondaCommand = (): string =>
  `${getCondaCommand()} activate ${
    process.env.MINICONDA_ENVIRONMENT as string
  }`;

const runCommands = async (
  commands: string[],
  workingDir?: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const commandString = commands.join(' && ');
    console.log(`Executing ${commandString}...`);
    const childProcess = spawn(commandString, { shell: true, cwd: workingDir });

    let output = '';
    let error = '';

    // Log output from the child process
    childProcess.stdout.on('data', (data) => {
      console.log(data.toString());
      output += data.toString();
    });
    childProcess.stderr.on('data', (data) => {
      console.error(data.toString());
      error += data.toString();
    });

    childProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Commands failed: ${commandString}: ${error}`));
      } else {
        resolve(output);
      }
    });
  });
};

const getFilesFromRequest = (files: Files): File[] => {
  if (!files) {
    return [];
  }
  return Object.values(files).flatMap((x) => x);
};

const generateRandomString = (length: number): string => {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

const removeEndingDot = (str: string): string => {
  return str.endsWith('.') ? str.slice(0, -1) : str;
};

const deleteFile = (path: string) => {
  unlink(path, () => {
    console.log(path + ' deleted');
  });
};

const createOrClearFolder = (folderPath: string) => {
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  } else {
    readdir(folderPath, (err, files) => {
      if (err) {
        throw err;
      }

      for (const file of files) {
        deleteFile(path.join(folderPath, file));
      }
    });
  }
};

const capitalize = (s?: string) => (s && s[0].toUpperCase() + s.slice(1)) || '';

export {
  getCondaPath,
  removeEndingDot,
  getActivateCondaCommand,
  runCommands,
  getFilesFromRequest,
  generateRandomString,
  deleteFile,
  capitalize,
  createOrClearFolder,
};
