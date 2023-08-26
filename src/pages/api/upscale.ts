import { withMultiOperationsCancellation } from '@appHelpers/cancellationToken';
import { apiHandler } from '@backendHelpers/apiHelper';
import {
  convertToImageFileData,
  getFilesFromRequest,
  processRequestWithFiles,
} from '@backendHelpers/formidableHelper';
import { UpscaleModel } from '@dataTransferTypes/upscaleModel';
import { SftpService } from '@services/sftpService';
import { UpscalerService } from '@services/upscalerService';
import { NextApiRequest, NextApiResponse } from 'next';
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
    await withMultiOperationsCancellation(
      new Set(uploadImmediately ? ['upscale', 'ftp_upload'] : ['upscale']),
      async (cancellationToken) => {
        if (uploadImmediately) {
          cancellationToken.addCancellationCallback(async () => {
            await sftpService.disconnect(cancellationToken);
          });
        }
        const images = getFilesFromRequest(files);
        console.log(`Processing ${images.length} images...`);

        let ftpConnectionPromise = Promise.resolve();

        const uploadPromises = [];
        // Sequentially executing as upscaling is a GPU heavy operation and hardly can be run in parallel
        let index = 0;
        for (const image of images) {
          if (cancellationToken.isCancellationRequested) {
            break;
          }
          if (uploadImmediately && index++ === 0) {
            ftpConnectionPromise =
              sftpService.connectIfNeeded(cancellationToken);
          }
          const convertedImage = convertToImageFileData(image);
          const upscaledFilePath = await upscalerService.upscaleWithEvents(
            io,
            convertedImage,
            image.newFilename,
            fields.modelName as unknown as UpscaleModel,
            0,
            uploadImmediately ? 0.5 : 1
          );
          if (upscaledFilePath && uploadImmediately) {
            await ftpConnectionPromise; // wait until the connection is initialized
            convertedImage.filePath = upscaledFilePath;
            uploadPromises.push(
              sftpService.uploadWithEvents(
                io,
                convertedImage,
                cancellationToken,
                0.5
              )
            ); // No await here, remember promise to await later (we want the next upscale operation to start without waiting for upload)
          }
        }

        await Promise.all(uploadPromises); // wait for the rest of upload opeartions.
      }
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
