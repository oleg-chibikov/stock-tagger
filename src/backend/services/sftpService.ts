import { CancellationToken } from '@appHelpers/cancellationToken';
import { throttle } from '@appHelpers/throttle';
import { emitEvent } from '@backendHelpers/socketHelper';
import { ImageFileData } from '@dataTransferTypes/imageFileData';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import Client from 'ssh2-sftp-client';
import { Service } from 'typedi';

@Service()
class SftpService {
  // Inject the sftp client as a dependency
  constructor(private sftp: Client) {
    const logError = (msg: string, err: any) =>
      console.error(msg, err.message ?? err);

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
  }

  async connectIfNeeded(cancellationToken: CancellationToken): Promise<void> {
    return new Promise(async (resolve, reject) => {
      cancellationToken.addCancellationCallback(reject);
      console.log('Checking SFTP connection...');
      const sftpConfig = {
        host: process.env.SFTP_HOST,
        port: parseInt(process.env.SFTP_PORT ?? ''),
        username: process.env.SFTP_USERNAME,
        password: process.env.SFTP_PASSWORD,
      };
      try {
        await this.sftp.list('/remote/directory');
        // Listing succeeded, indicating the client is connected
        console.log('Already connected to SFTP');
        resolve();
      } catch (error) {
        // Listing failed, indicating the client is not connected
        console.log('SFTP Client is not yet connected. Connecting...');
        try {
          await this.sftp.connect(sftpConfig);
          console.log('Connected to SFTP');
          resolve();
        } catch (error) {
          console.error(`Failed to connect to SFTP: ${error}`);
          reject();
        }
      } finally {
        cancellationToken.removeCancellationCallback(reject);
      }
    });
  }

  async disconnect(cancellationToken: CancellationToken) {
    console.log('Disconnecting from SFTP...');
    return new Promise<void>(async (resolve, reject) => {
      cancellationToken.addCancellationCallback(reject);
      try {
        await this.sftp.end();
        console.log(`Disconnected from SFTP`);
        resolve();
      } catch (error) {
        console.error(`Failed to disconnect from SFTP: ${error}`);
        reject();
      } finally {
        cancellationToken.removeCancellationCallback(reject);
      }
    });
  }

  async uploadWithEvents(
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    image: ImageFileData,
    cancellationToken: CancellationToken,
    initialProgress: number = 0,
    finalProgress: number = 1
  ) {
    const range = finalProgress - initialProgress;
    try {
      emitEvent(io, image.fileName, initialProgress, 'ftp_upload');
      await this.uploadToSftp(
        image.filePath,
        image.fileName,
        // throttling is needed as too many events might reset the socket connection and some events are lost in this case
        throttle((fileName, progress) => {
          if (cancellationToken.isCancellationRequested) {
            return;
          }
          // Emit an event with the progress of the file transfer
          emitEvent(
            io,
            fileName,
            initialProgress + progress * range,
            'ftp_upload'
          );
        }, 200),
        cancellationToken
      );
      emitEvent(io, image.fileName as string, finalProgress, 'ftp_upload_done');
    } catch (err: unknown) {
      console.log('Error uploading to SFTP: ' + err);
      emitEvent(io, image.fileName, finalProgress, 'ftp_upload_error');
    }
  }

  private async uploadToSftp(
    filePath: string,
    fileName: string,
    onProgress: (fileName: string, progress: number) => void,
    cancellationToken: CancellationToken
  ): Promise<void> {
    console.log(`Uploading ${filePath} to SFTP (${fileName})...`);
    return new Promise<void>(async (resolve, reject) => {
      cancellationToken.addCancellationCallback(reject);
      try {
        await this.sftp.fastPut(filePath, fileName, {
          concurrency: 64,
          chunkSize: 32768,
          step: (transferred, _chunk, total) => {
            const progress = transferred / total;
            console.log(
              `Transferred: ${transferred} / ${total} (${
                progress * 100
              }%) for ${fileName}`
            );
            onProgress(fileName, progress);
          },
        });
        console.log(`Upload successful for ${fileName}`);
        resolve();
      } catch (error) {
        console.error(`Upload failed for ${fileName}: ${error}`);
        reject(error);
      } finally {
        cancellationToken.removeCancellationCallback(reject);
      }
    });
  }
}

export { SftpService };
