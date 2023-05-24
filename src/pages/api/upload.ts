import { apiHandler } from '@backendHelpers/apiHelper';
import {
  getFilesFromRequest,
  processRequestWithFiles,
} from '@backendHelpers/formidableHelper';
import { toServerUrl } from '@backendHelpers/uploadHelper';
import { CANCEL, PROGRESS } from '@dataTransferTypes/event';
import { ImageFileData } from '@dataTransferTypes/imageFileData';
import { Operation } from '@dataTransferTypes/operation';
import { OperationStatus } from '@dataTransferTypes/operationStatus';
import { UploadEvent } from '@dataTransferTypes/uploadEvent';
import { SftpService } from '@services/sftpService';
import EventEmitter from 'events';
import { NextApiRequest, NextApiResponse } from 'next';
import { CancellationToken } from 'sharedHelper';
import Container from 'typedi';
import { NextApiResponseWithSocket } from './socketio';

const uploadToSftp = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Uploading images to SFTP...');
  const socketRes = res as NextApiResponseWithSocket;
  const io = socketRes.socket.server.io!;
  const sftpService = Container.get(SftpService);
  const eventEmitter = Container.get(EventEmitter);
  processRequestWithFiles(req, res, async (fields, files) => {
    const uploadImagesToFtp = async (
      images: ImageFileData[]
    ): Promise<void> => {
      console.log(`Uploading to ftp...`);
      if (!(await sftpService.isConnected())) {
        await sftpService.connect();
      }
      const cancellationToken = new CancellationToken();
      cancellationToken.addCancellationCallback(() => {
        sftpService.disconnect();
      });
      const cancelHandler = (operation: Operation) => {
        if (operation === 'ftp_upload') {
          console.log(
            `Got ${operation} cancellation request from event emitter`
          );
          cancellationToken.cancel();
        }
      };
      eventEmitter.on(CANCEL, cancelHandler);
      try {
        for (const image of images) {
          if (cancellationToken.isCancellationRequested) {
            break;
          }
          try {
            emitEvent(image.fileName, 0.1, 'ftp_upload');
            await sftpService.uploadToSftp(
              image.filePath,
              image.fileName,
              (fileName, progress) => {
                // Emit an event with the progress of the file transfer
                emitEvent(fileName, progress, 'ftp_upload');
              },
              cancellationToken
            );
            emitEvent(image.fileName as string, 1, 'ftp_upload_done');
          } catch (err: unknown) {
            console.log('Error uploading to SFTP: ' + err);
            emitEvent(image.fileName, 1, 'ftp_upload_error');
          } finally {
            // deleteFile(image.filePath);
          }
        }
      } finally {
        eventEmitter.off(CANCEL, cancelHandler);
      }
    };

    const images = getFilesFromRequest(files);

    if (images.length) {
      console.log(`Uploading ${images.length} original images...`);

      await uploadImagesToFtp(
        images.map((x) => ({
          filePath: x.filepath,
          fileName: x.originalFilename as string,
        }))
      );
    }

    const upscaledImagesData = fields?.upscaledImagesData;
    if (upscaledImagesData?.length) {
      const imagesFileData = JSON.parse(
        upscaledImagesData as string
      ) as ImageFileData[];
      console.log(`Uploading ${imagesFileData.length} upscaled images...`);
      for (const image of imagesFileData) {
        image.filePath = toServerUrl(image.filePath);
      }

      await uploadImagesToFtp(imagesFileData);
    }

    res.status(200).end();
  });

  const emitEvent = (
    fileName: string,
    progress: number,
    operationStatus: OperationStatus,
    filePath?: string
  ) => {
    io.emit(PROGRESS, {
      fileName,
      filePath,
      progress,
      operationStatus,
    } as UploadEvent);
  };
};
export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiHandler({
  POST: uploadToSftp,
});
