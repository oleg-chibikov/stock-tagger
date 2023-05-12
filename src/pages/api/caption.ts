import { apiHandler } from '@backendHelpers/apiHelper';
import { processRequestWithFiles } from '@backendHelpers/formidableHelper';
import { CaptionEvent } from '@dataTransferTypes/caption';
import { CAPTION_AVAILIABLE } from '@dataTransferTypes/event';
import { CaptioningService } from '@services/captioningService';
import { deleteFile, getFilesFromRequest } from '@services/helper';
import EventEmitter from 'events';
import { File } from 'formidable';
import { readFile } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import Container from 'typedi';

const getCaptions = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log('Getting captions...');
  const captioningService = Container.get(CaptioningService);
  const eventEmitter = Container.get(EventEmitter);
  processRequestWithFiles(req, res, async (_fields, files) => {
    const images = getFilesFromRequest(files);

    const annotationsPath = `annotations\\${process.env.CAPTIONING_DATASET}.json`;

    for (const image of images.filter((x) =>
      x.newFilename.match(/\.(png)$/i)
    )) {
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

    res.status(200).end();
  });

  const emitEvent = (
    image: File,
    caption: string,
    similarity: number,
    isFromFileMetadata: boolean
  ) => {
    eventEmitter.emit(CAPTION_AVAILIABLE, {
      fileName: image.originalFilename,
      caption: caption,
      similarity: similarity,
      isFromFileMetadata: isFromFileMetadata,
    } as CaptionEvent);
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiHandler({
  POST: getCaptions,
});
