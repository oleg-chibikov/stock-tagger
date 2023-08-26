import { withCancellation } from '@appHelpers/cancellationToken';
import { apiHandler } from '@backendHelpers/apiHelper';
import {
  getFilesFromRequest,
  processRequestWithFiles,
} from '@backendHelpers/formidableHelper';
import { deleteFile } from '@backendHelpers/fsHelper';
import { CaptionEvent } from '@dataTransferTypes/caption';
import { CAPTION_AVAILIABLE } from '@dataTransferTypes/event';
import { CaptioningService } from '@services/captioningService';
import { File } from 'formidable';
import { readFile } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';
import { NextApiResponseWithSocket } from './socketio';

const getCaptions = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Getting captions...');
  const socketRes = res as NextApiResponseWithSocket;
  const io = socketRes.socket.server.io!;

  const emitEvent = (
    image: File,
    caption: string,
    similarity: number,
    isFromFileMetadata: boolean
  ) => {
    io.emit(CAPTION_AVAILIABLE, {
      fileName: image.originalFilename,
      caption: caption,
      similarity: similarity,
      isFromFileMetadata: isFromFileMetadata,
    } as CaptionEvent);
    console.log(`Emitted caption: ${caption}`);
  };

  const captioningService = Container.get(CaptioningService);
  processRequestWithFiles(req, res, async (_fields, files) => {
    const images = getFilesFromRequest(files);
    const annotationsPath = `annotations\\${process.env.CAPTIONING_DATASET}.json`;

    await withCancellation('caption', async (cancellationToken) => {
      for (const image of images.filter((x) =>
        x.newFilename.match(/\.(png)$/i)
      )) {
        if (cancellationToken.isCancellationRequested) {
          break;
        }
        readFile(image.filepath, (err, buffer) => {
          if (err) {
            console.log(`Cannot read file ${image.originalFilename}: ${err}`);
            return;
          }
          const textChunks = captioningService.extractTextChunks(buffer);
          for (const chunk of textChunks) {
            console.log('Extracted text chunk: ' + chunk);
            emitEvent(image, chunk, 1, true);
          }
        });
      }

      // Process sequentially as CLIP captioning is a gpu heavy operation
      for (const image of images) {
        if (cancellationToken.isCancellationRequested) {
          break;
        }
        try {
          const batchSize = req.query.batchSize
            ? Number(req.query.batchSize)
            : undefined;
          const numberOfAnnotations = req.query.numberOfAnnotations
            ? Number(req.query.numberOfAnnotations)
            : undefined;
          const numberOfResults = req.query.numberOfResults
            ? Number(req.query.numberOfResults)
            : undefined;
          const reverseImageSearchResults =
            await captioningService.generateCaptions(
              image.filepath,
              annotationsPath,
              batchSize,
              numberOfAnnotations,
              numberOfResults
            );

          console.log(
            `Reverse image search results for ${image.originalFilename}:`,
            reverseImageSearchResults
          );
          for (const result of reverseImageSearchResults
            .flatMap((x) => x)
            .sort((a, b) => b.similarity - a.similarity)) {
            emitEvent(image, result.caption, result.similarity, false);
          }
        } finally {
          deleteFile(image.filepath);
        }
      }
    });
  });
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiHandler({
  POST: getCaptions,
});
