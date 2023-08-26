import { getCondaPath, runCommands } from '@backendHelpers/commandHelper';
import { createOrClearFolder } from '@backendHelpers/fsHelper';
import { CaptioningService } from '@services/captioningService';
import { UpscalerService } from '@services/upscalerService';
import EventEmitter from 'events';
import 'reflect-metadata';
import Client from 'ssh2-sftp-client';
import { Container } from 'typedi';

const bootedServices = new Set();

const boot = async () => {
  const register = async (name: string, register: () => Promise<void>) => {
    if (!bootedServices.has(name)) {
      console.log(`Exceuting ${name}...`);

      await register();

      bootedServices.add(name);
      console.log(`Finished executing ${name}`);
    }
  };

  await register('Register Event Emitter', async () => {
    const exists = Container.has(EventEmitter);
    if (exists) {
      console.log('EventEmitter already registered');
      return;
    }
    const emitter = new EventEmitter();
    Container.set(EventEmitter, emitter);
  });

  await register('Create Conda Environment', async () => {
    if (Boolean(process.env.SKIP_INSTALL)) {
      return;
    }
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
    createOrClearFolder('public');
  });

  await register('Register Sftp', async () => {
    const exists = Container.has(Client);
    if (exists) {
      console.log('Sftp client already registered');
      return;
    }
    const sftp = new Client();
    // Register the sftp client with the Container
    Container.set(Client, sftp);
  });

  await register('Register Upscaler Service', async () => {
    const upscalerService = Container.get(UpscalerService);
    if (Boolean(process.env.SKIP_INSTALL)) {
      return;
    }
    await upscalerService.installDependencies();
  });

  await register('Register Captioning Service', async () => {
    const captioningService = Container.get(CaptioningService);
    if (Boolean(process.env.SKIP_INSTALL)) {
      return;
    }
    await captioningService.installDependencies();
  });

  return Array.from(bootedServices);
};

export { boot };
