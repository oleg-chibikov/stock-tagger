import { apiHandler } from '@backendHelpers/apiHelper';
import {
  getFilesFromRequest,
  processRequestWithFiles,
} from '@backendHelpers/formidableHelper';
import { deleteFile } from '@backendHelpers/fsHelper';
import { outputPath, toWebUrl } from '@backendHelpers/uploadHelper';
import { CANCEL, PROGRESS } from '@dataTransferTypes/event';
import { Operation } from '@dataTransferTypes/operation';
import { OperationStatus } from '@dataTransferTypes/operationStatus';
import { UploadEvent } from '@dataTransferTypes/uploadEvent';
import { UpscaleModel } from '@dataTransferTypes/upscaleModel';
import { UpscalerService } from '@services/upscalerService';
import EventEmitter from 'events';
import { File } from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';
import { CancellationToken } from 'sharedHelper';
import Container from 'typedi';
import { NextApiResponseWithSocket } from './socketio';

const upscale = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Upscaling images...');
  const socketRes = res as NextApiResponseWithSocket;
  const io = socketRes.socket.server.io!;
  const upscalerService = Container.get(UpscalerService);
  const eventEmitter = Container.get(EventEmitter);
  processRequestWithFiles(req, res, async (fields, files) => {
    const upscaleImage = async (image: File): Promise<void> => {
      try {
        emitEvent(image.originalFilename as string, 0.1, 'upscale');
        const outputFilePath = await upscalerService.upscale(
          fields.modelName as UpscaleModel,
          image.filepath,
          outputPath,
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

    const cancellationToken = new CancellationToken();
    const cancelHandler = (operation: Operation) => {
      if (operation === 'upscale') {
        console.log(`Got ${operation} cancellation request from event emitter`);
        cancellationToken.cancel();
      }
    };
    eventEmitter.on(CANCEL, cancelHandler);

    try {
      const images = getFilesFromRequest(files);
      console.log(`Processing ${images.length} images...`);

      // Sequentially executing as upscaling is a GPU heavy operation and hardly can be run in parallel
      for (const image of images) {
        if (cancellationToken.isCancellationRequested) {
          break;
        }
        await upscaleImage(image);
      }
    } finally {
      eventEmitter.off(CANCEL, cancelHandler);
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
  POST: upscale,
});
