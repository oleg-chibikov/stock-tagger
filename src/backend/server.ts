import { CaptioningService } from '@services/captioningService';
import { UpscalerService } from '@services/upscalerService';
import EventEmitter from 'events';
import 'reflect-metadata';
import Client from 'ssh2-sftp-client';
import { Container } from 'typedi';
import {
  createFolderIfNotExists,
  getCondaPath,
  runCommands,
} from './services/helper';

const bootedServices = new Set();

const bootHandler = async () => {
  const logError = (msg: string, err: any) =>
    console.error(msg, err.message ?? err);

  const register = async (name: string, register: () => Promise<void>) => {
    if (!bootedServices.has(name)) {
      console.log(`Exceuting ${name}...`);

      await register();

      bootedServices.add(name);
      console.log(`Finished executing ${name}`);
    }
  };
  await register('Create Conda Environment', async () => {
    const environments = await runCommands(
      ['conda info --env'],
      getCondaPath()
    );
    if (
      environments.indexOf(process.env.MINICONDA_ENVIRONMENT as string) >= 0
    ) {
      console.log(`${process.env.MINICONDA_ENVIRONMENT} already exists`);
      return;
    }
    await runCommands(
      [
        `conda create -n "${
          process.env.MINICONDA_ENVIRONMENT as string
        }" -y pip`,
      ],
      getCondaPath()
    );
  });

  await register('Create Folders', async () => {
    createFolderIfNotExists('output');
  });

  await register('Sftp', async () => {
    const sftp = new Client();
    // Define or import the sftpConfig object
    const sftpConfig = {
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT ?? ''),
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD,
    };
    // Register the sftp client with the Container
    Container.set(Client, sftp);

    // Disconnect from the SFTP server on app shutdown
    process.on('SIGINT', async () => {
      console.log('Received SIGINT signal');
      try {
        await sftp.end();
        console.log('Disconnected from sftp');
        process.exit(0);
      } catch (err: unknown) {
        logError('Failed to disconnect from sftp: ', err);
        process.exit(1);
      }
    });

    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM signal');
      try {
        await sftp.end();
        console.log('Disconnected from sftp');
        process.exit(0);
      } catch (err: unknown) {
        logError('Failed to disconnect from sftp: ', err);
        process.exit(1);
      }
    });

    process.on('exit', async () => {
      console.log('Exiting app');
      try {
        await sftp.end();
        console.log('Disconnected from sftp');
      } catch (err: unknown) {
        logError('Failed to disconnect from sftp: ', err);
      }
    });

    try {
      await sftp.connect(sftpConfig);
      console.log('Connected to sftp');
    } catch (err: unknown) {
      logError('Failed to connect to sftp:', err);
    }
  });

  await register('Event Emitter', async () => {
    const emitter = new EventEmitter();
    Container.set(EventEmitter, emitter);
  });

  await register('Upscaler Service', async () => {
    const upscalerService = Container.get(UpscalerService);
    await upscalerService.installDependencies();
  });

  await register('Captioning Service', async () => {
    const captioningService = Container.get(CaptioningService);
    await captioningService.installDependencies();
  });

  return Array.from(bootedServices);
};

export default bootHandler;
