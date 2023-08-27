import { CancellationToken } from '@appHelpers/cancellationToken';
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
  workingDir?: string,
  cancellationToken?: CancellationToken
): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const commandString = commands.join(' && ');
    console.log(`Executing ${commandString}...`);
    const childProcess = spawn(commandString, { shell: true, cwd: workingDir });

    let output = '';
    let error = '';
    let cancelHandler = () => {
      console.log(`Killing spawned process...`);
      const killResult = childProcess.kill();
      console.log(`Spawned process for kill result: ${killResult}`);
      reject(`Cancelled`);
    };

    cancellationToken?.addCancellationCallback(cancelHandler);

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
      cancellationToken?.removeCancellationCallback(cancelHandler);
    });
  });

export { getActivateCondaCommand, getCondaPath, runCommands };
