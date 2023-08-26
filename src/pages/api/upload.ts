import {
  CancellationToken,
  withCancellation,
} from '@appHelpers/cancellationToken';
import { apiHandler } from '@backendHelpers/apiHelper';
import {
  getFilesFromRequest,
  processRequestWithFiles,
} from '@backendHelpers/formidableHelper';
import { toServerUrl } from '@backendHelpers/uploadHelper';
import { ImageFileData } from '@dataTransferTypes/imageFileData';
import { SftpService } from '@services/sftpService';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';
import { NextApiResponseWithSocket } from './socketio';

const uploadToSftp = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Uploading images to SFTP...');
  const socketRes = res as NextApiResponseWithSocket;
  const io = socketRes.socket.server.io!;

  const sftpService = Container.get(SftpService);
  const uploadImagesToFtp = async (
    images: ImageFileData[],
    cancellationToken: CancellationToken
  ): Promise<void> => {
    console.log(`Uploading to ftp...`);

    for (const image of images) {
      if (cancellationToken.isCancellationRequested) {
        break;
      }

      await sftpService.uploadWithEvents(io, image, cancellationToken);
    }
  };

  processRequestWithFiles(req, res, async (fields, files) => {
    return new Promise<void>(async (resolve, reject) => {
      withCancellation(async (cancellationToken) => {
        cancellationToken.addCancellationCallback(async () => {
          await sftpService.disconnect(cancellationToken);
          resolve();
        });

        await sftpService.connectIfNeeded(cancellationToken);
        const images = getFilesFromRequest(files);
        if (images.length) {
          console.log(`Uploading ${images.length} original images...`);

          const notUpscaledImages = images.map(
            (x) =>
              ({
                filePath: x.filepath,
                fileName: x.originalFilename as string,
              }) as ImageFileData
          );

          await uploadImagesToFtp(notUpscaledImages, cancellationToken);
          console.log('Uploaded all original images');
        }

        const upscaledImages = fields?.upscaledImagesData;
        if (upscaledImages?.length) {
          const imagesFileData = JSON.parse(
            upscaledImages as unknown as string
          ) as ImageFileData[];
          console.log(`Uploading ${imagesFileData.length} upscaled images...`);
          for (const image of imagesFileData) {
            image.filePath = toServerUrl(image.filePath);
          }

          await uploadImagesToFtp(imagesFileData, cancellationToken);
          console.log('Uploaded all upscaled images');
        }

        res.status(200).end();
      }, 'ftp_upload');
    });
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiHandler({
  POST: uploadToSftp,
});
