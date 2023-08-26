import { collectionToString } from '@appHelpers/collectionHelper';
import { CANCEL } from '@dataTransferTypes/event';
import { Operation } from '@dataTransferTypes/operation';
import { spawn } from 'child_process';
import EventEmitter from 'events';
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
  eventEmitter?: EventEmitter,
  operation?: Operation
): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    const commandString = commands.join(' && ');
    console.log(`Executing ${commandString}...`);
    const childProcess = spawn(commandString, { shell: true, cwd: workingDir });

    let output = '';
    let error = '';
    let cancelHandler = (operationsToCancel: Operation[]) => {
      if (!operation) {
        return;
      }
      console.log(
        `[commandHelper] Got ${collectionToString(
          operationsToCancel
        )} cancellation request from event emitter. Currently executing operation is ${operation}`
      );
      const set = new Set(operationsToCancel);
      if (set.has(operation)) {
        console.log(`Killing spawned process for ${operation}...`);
        const killResult = childProcess.kill();
        console.log(
          `Spawned process for ${operation} kill result: ${killResult}`
        );
        reject(`Cancelled ${operation}`);
      }
    };

    eventEmitter?.on(CANCEL, cancelHandler);

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
      eventEmitter?.off(CANCEL, cancelHandler);
    });
  });

export { getActivateCondaCommand, getCondaPath, runCommands };
