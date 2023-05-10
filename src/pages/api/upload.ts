import { PROGRESS } from '@dataTransferTypes/event';
import {
  ImageFileData,
  UploadEvent,
  UploadOperation,
} from '@dataTransferTypes/upload';
import { getFilesFromRequest } from '@services/helper';
import { SftpService } from '@services/sftpService';
import EventEmitter from 'events';
import formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';
import { toServerUrl } from '../../backend/helpers/uploadHelper';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Uploading images...');
  const sftpService = Container.get(SftpService);
  const eventEmitter = Container.get(EventEmitter);
  const form = new formidable.IncomingForm({
    keepExtensions: true,
    multiples: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred');
      return;
    }

    const uploadImagesToFtp = async (
      images: ImageFileData[]
    ): Promise<void> => {
      console.log(`Uploading to ftp...`);
      // Create an array of promises for each image upload and execute in parallel
      const promises = images.map(async (image) => {
        try {
          emitEvent(image.fileName, 0.1, 'ftp_upload');
          await sftpService.uploadToSftp(
            image.filePath,
            image.fileName,
            (fileName, progress) => {
              // Emit an event with the progress of the file transfer
              emitEvent(fileName, progress, 'ftp_upload');
            }
          );
          emitEvent(image.fileName as string, 1, 'ftp_upload_done');
        } catch (err: unknown) {
          emitEvent(image.fileName, 1, 'ftp_upload_error');
        } finally {
          // deleteFile(image.filePath);
        }
      });

      // Wait for all the promises to resolve
      await Promise.all(promises);
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
    operation: UploadOperation,
    filePath?: string
  ) => {
    eventEmitter.emit(PROGRESS, {
      fileName,
      filePath,
      progress,
      operation,
    } as UploadEvent);
  };
}
export const config = {
  api: {
    bodyParser: false,
  },
};
