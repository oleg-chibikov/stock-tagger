import { CancellationToken } from 'sharedHelper';
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

  async isConnected(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Check if connected
      this.sftp
        .list('/remote/directory')
        .then(() => {
          // Listing succeeded, indicating the client is connected
          console.log('Client is connected');
          resolve(true);
        })
        .catch((err) => {
          // Listing failed, indicating the client is not connected
          console.log('Client is not connected');
          resolve(false);
        });
    });
  }

  async disconnect() {
    this.sftp.end();
  }

  async connect() {
    console.log('Connecting to SFTP...');
    const sftpConfig = {
      host: process.env.SFTP_HOST,
      port: parseInt(process.env.SFTP_PORT ?? ''),
      username: process.env.SFTP_USERNAME,
      password: process.env.SFTP_PASSWORD,
    };

    await this.sftp.connect(sftpConfig);
    console.log('Connected to SFTP');
  }

  public async uploadToSftp(
    filePath: string,
    fileName: string,
    onProgress: (fileName: string, progress: number) => void,
    cancellationToken: CancellationToken
  ): Promise<void> {
    console.log(`Uploading ${filePath} to SFTP (${fileName})...`);
    return new Promise<void>((resolve, reject) => {
      cancellationToken.addCancellationCallback(reject);
      this.sftp
        .fastPut(filePath, fileName, {
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
        })
        .then(() => {
          console.log(`Upload successful for ${fileName}`);
          resolve();
        })
        .catch((error) => {
          reject(error);
        })
        .finally(() => {
          cancellationToken.removeCancellationCallback(reject);
        });
    });
  }
}

export { SftpService };
