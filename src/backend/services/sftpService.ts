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

  private async performFastPut(
    localPath: string,
    remotePath: string,
    onProgress: (fileName: string, progress: number) => void
  ) {
    console.log(`Uploading ${localPath} to SFTP (${remotePath})...`);
    return new Promise<void>((resolve, reject) => {
      this.sftp
        .fastPut(localPath, remotePath, {
          concurrency: 64,
          chunkSize: 32768,
          step: (transferred, _chunk, total) => {
            const progress = transferred / total;
            console.log(
              `Transferred: ${transferred} / ${total} (${
                progress * 100
              }%) for ${remotePath}`
            );
            onProgress(remotePath, progress);
          },
        })
        .then(() => {
          console.log(`Upload successful for ${remotePath}`);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  private async connectToSftp() {
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
    onProgress: (fileName: string, progress: number) => void
  ) {
    try {
      // Perform the fastPut operation
      await this.performFastPut(filePath, fileName, onProgress);
    } catch (error: any) {
      if (error.message === 'fastPut: _fastPut: No SFTP connection available') {
        console.log('SFTP connection not available. Retrying...');

        // Call connectToSftp to establish the connection
        await this.connectToSftp();

        // Retry the uploadToSftp method
        await this.performFastPut(filePath, fileName, onProgress);
      } else {
        // Re-throw the error if it's not the expected "No SFTP connection available" error
        throw error;
      }
    }
  }
}

export { SftpService };
