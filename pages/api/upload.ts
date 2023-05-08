import { UploadEvent, UploadOperation } from '@dataTransferTypes/upload';
import { deleteFile, getFilesFromRequest } from '@services/helper';
import { SftpService } from '@services/sftpService';
import { UpscalerService } from '@services/upscalerService';
import EventEmitter from 'events';
import formidable, { File } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

interface TempResult {
  outputFilePath: string;
  originalFilename: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Uploading images...');
  const upscalerService = Container.get(UpscalerService);
  const sftpService = Container.get(SftpService);
  const eventEmitter = Container.get(EventEmitter);
  const form = new formidable.IncomingForm({
    keepExtensions: true,
    multiples: true,
  });

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred');
      return;
    }

    const upscaleProgress = 0.1;
    const halfProgress = 0.5;

    const upscaleImage = async (image: File): Promise<string> => {
      try {
        eventEmitter.emit(PROGRESS, {
          fileName: image.originalFilename,
          progress: upscaleProgress,
          operation: 'upscale',
        });
        const outputDirectory = 'output';
        return await upscalerService.upscale(
          image.filepath,
          outputDirectory,
          image.newFilename
        );
      } finally {
        deleteFile(image.filepath);
      }
    };

    const upscaleImages = async (): Promise<TempResult[]> => {
      console.log(`Processing ${images.length} images...`);

      const results: TempResult[] = [];

      // Sequentially executing as upscaling is a GPU heavy operation and hardly can be run in parallel
      for (const image of images) {
        const outputFilePath = await upscaleImage(image);
        emitEvent(image.originalFilename as string, halfProgress, 'upscale');
        results.push({
          outputFilePath,
          originalFilename: image.originalFilename as string,
        });
      }
      return results;
    };

    const uploadImagesToFtp = async (images: TempResult[]): Promise<void> => {
      console.log(`Uploading to ftp...`);
      // Create an array of promises for each image upload and execute in parallel
      const promises = images.map(async (result) => {
        try {
          emitEvent(result.originalFilename, halfProgress, 'ftp_upload');
          await sftpService.uploadToSftp(
            result.outputFilePath,
            result.originalFilename,
            (fileName, progress) => {
              // Emit an event with the progress of the file transfer
              emitEvent(fileName, halfProgress + progress / 2, 'ftp_upload');
            }
          );
        } finally {
          deleteFile(result.outputFilePath);
        }
      });

      // Wait for all the promises to resolve
      await Promise.all(promises);
    };

    const images = getFilesFromRequest(files);
    const results = await upscaleImages();

    await uploadImagesToFtp(results);

    res.status(200).end();
  });

  const emitEvent = (
    fileName: string,
    progress: number,
    operation: UploadOperation
  ) => {
    eventEmitter.emit(PROGRESS, {
      fileName,
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
