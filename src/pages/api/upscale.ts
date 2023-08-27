import {
  CancellationToken,
  withMultiOperationsCancellation,
} from '@appHelpers/cancellationToken';
import { apiHandler } from '@backendHelpers/apiHelper';
import {
  convertToImageFileData,
  getFilesFromRequest,
  processRequestWithFiles,
} from '@backendHelpers/formidableHelper';
import { UpscaleModel } from '@dataTransferTypes/upscaleModel';
import { SftpService } from '@services/sftpService';
import { UpscalerService } from '@services/upscalerService';
import { File } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import Queue from 'queue-promise';
import Container from 'typedi';

import { NextApiResponseWithSocket } from './socketio';

const upscale = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Upscaling images...');
  const socketRes = res as NextApiResponseWithSocket;
  const io = socketRes.socket.server.io!;
  const upscalerService = Container.get(UpscalerService);
  const sftpService = Container.get(SftpService);
  processRequestWithFiles(req, res, async (fields, files) => {
    const uploadImmediately = JSON.parse(
      fields.uploadImmediately as unknown as string
    ) as boolean;
    const upscaleQueue = new Queue({
      concurrent: 1,
    });

    const uploadQueue = uploadImmediately
      ? new Queue({
          concurrent: 1,
        })
      : undefined;

    const processImages = async (
      cancellationToken: CancellationToken
    ): Promise<void> =>
      new Promise<void>(async (resolve, reject) => {
        if (uploadImmediately) {
          cancellationToken.addCancellationCallback(async () => {
            await sftpService.disconnect(cancellationToken);
          });
          uploadQueue?.enqueue(() =>
            sftpService.connectIfNeeded(cancellationToken)
          );
        }
        const images = getFilesFromRequest(files);
        console.log(`Processing ${images.length} images...`);
        let upscaleFinished = false;
        let uploadFinished = !uploadImmediately;

        const processImage =
          (image: File): (() => Promise<void>) =>
          async () => {
            if (cancellationToken.isCancellationRequested) {
              reject();
              return Promise.reject();
            }
            const convertedImage = convertToImageFileData(image);

            const upscaleImage = async () =>
              upscalerService.upscaleWithEvents(
                io,
                convertedImage,
                image.newFilename,
                fields.modelName as unknown as UpscaleModel,
                cancellationToken,
                0,
                uploadImmediately ? 0.5 : 1
              );

            const upscaledFilePath = await upscaleImage();

            if (upscaledFilePath && uploadImmediately) {
              convertedImage.filePath = upscaledFilePath;
              uploadFinished = false;

              const uploadImageToSftp = () => {
                if (cancellationToken.isCancellationRequested) {
                  reject();
                  return Promise.reject();
                }
                return sftpService.uploadWithEvents(
                  io,
                  convertedImage,
                  cancellationToken,
                  0.5
                );
              };

              uploadQueue?.enqueue(uploadImageToSftp);
            }
          };

        const upscaleTasks = images.map(processImage);

        const resolveWhenDone = () => {
          if (uploadFinished && upscaleFinished) {
            resolve();
          }
        };

        upscaleQueue.enqueue(upscaleTasks);
        uploadQueue?.on('end', () => {
          uploadFinished = true;
          resolveWhenDone();
        });

        upscaleQueue.on('end', () => {
          upscaleFinished = true;
          resolveWhenDone();
        });
      });

    await withMultiOperationsCancellation(
      new Set(uploadImmediately ? ['upscale', 'ftp_upload'] : ['upscale']),
      processImages
    );
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiHandler({
  POST: upscale,
});
