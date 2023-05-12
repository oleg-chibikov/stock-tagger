import { spawn } from 'child_process';
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

export { getCondaPath, getActivateCondaCommand, runCommands };
