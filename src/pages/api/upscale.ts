import { apiHandler } from '@backendHelpers/apiHelper';
import {
  getFilesFromRequest,
  processRequestWithFiles,
} from '@backendHelpers/formidableHelper';
import { deleteFile } from '@backendHelpers/fsHelper';
import { outputDirectory, toWebUrl } from '@backendHelpers/uploadHelper';
import { PROGRESS } from '@dataTransferTypes/event';
import { UploadEvent, UploadOperation } from '@dataTransferTypes/upload';
import { UpscaleModel } from '@dataTransferTypes/upscaleModel';
import { UpscalerService } from '@services/upscalerService';
import EventEmitter from 'events';
import { File } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

const upscale = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Upscaling images...');
  const upscalerService = Container.get(UpscalerService);
  const eventEmitter = Container.get(EventEmitter);

  processRequestWithFiles(req, res, async (fields, files) => {
    const upscaleImage = async (image: File): Promise<void> => {
      try {
        emitEvent(image.originalFilename as string, 0.1, 'upscale');
        const outputFilePath = await upscalerService.upscale(
          fields.modelName as UpscaleModel,
          image.filepath,
          outputDirectory,
          image.newFilename
        );
        emitEvent(
          image.originalFilename as string,
          1,
          'upscale_done',
          toWebUrl(outputFilePath)
        );
      } catch (err: unknown) {
        emitEvent(image.originalFilename as string, 1, 'upscale_error');
      } finally {
        deleteFile(image.filepath);
      }
    };

    const upscaleImages = async (): Promise<void> => {
      console.log(`Processing ${images.length} images...`);

      // Sequentially executing as upscaling is a GPU heavy operation and hardly can be run in parallel
      for (const image of images) {
        await upscaleImage(image);
      }
    };

    const images = getFilesFromRequest(files);
    await upscaleImages();

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
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiHandler({
  POST: upscale,
});
