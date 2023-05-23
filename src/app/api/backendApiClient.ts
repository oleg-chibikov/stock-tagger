import { CaptionEvent } from '@dataTransferTypes/caption';
import { CAPTION_AVAILIABLE, PROGRESS } from '@dataTransferTypes/event';
import { ImageFileData, UploadEvent } from '@dataTransferTypes/upload';
import { UpscaleModel } from '@dataTransferTypes/upscaleModel';
import axios, { AxiosResponse } from 'axios';
import { delay } from 'sharedHelper';
import { ImageWithData, toFile } from '../helpers/imageHelper';
import { getSocket } from './socket';

const uploadCsv = async (fileContent: string) => {
  const url = 'https://contributor.stock.adobe.com/en/uploads';

  const response = await axios.post('/api/uploadCsv', {
    url,
    fileContent,
  });

  console.log(response.data.message);
};

const getCaptions = async (
  onProgress: (event: CaptionEvent) => void,
  imageData: ImageWithData[]
): Promise<void> => {
  return await postImagesWithSocket<CaptionEvent>(
    '/api/caption',
    CAPTION_AVAILIABLE,
    onProgress,
    imageData
  );
};

const upscale = async (
  onProgress: (event: UploadEvent) => void,
  imageData: ImageWithData[],
  modelName: UpscaleModel
): Promise<void> =>
  await postImagesWithSocket<UploadEvent>(
    '/api/upscale',
    PROGRESS,
    onProgress,
    imageData,
    undefined,
    { modelName: modelName }
  );

const uploadToSftp = async (
  onProgress: (event: UploadEvent) => void,
  imageData: ImageWithData[],
  upscaledImagesData: ImageFileData[]
): Promise<void> =>
  await postImagesWithSocket<UploadEvent>(
    '/api/upload',
    PROGRESS,
    onProgress,
    imageData,
    upscaledImagesData
  );

const postImagesWithSocket = async <TData>(
  mainEndpoint: string,
  eventName: string,
  onEvent: (data: TData) => void,
  imageData: ImageWithData[],
  upscaledImagesData?: ImageFileData[],
  data?: Record<string, string>
): Promise<void> => {
  const socket = await getSocket();
  const eventCallback = (data: TData) => {
    console.log(`Received ${eventName} event: ${JSON.stringify(data)}`);
    onEvent(data);
  };
  try {
    socket.on(eventName, eventCallback);
    console.log('Subscribed to socket events');

    const response = await postImages(
      mainEndpoint,
      imageData,
      upscaledImagesData,
      data
    );

    if (!isSuccessResponse(response)) {
      throw response.data;
    }
  } finally {
    const unsubscribe = async () => {
      await delay(3000); // give some time to receive the rest of the events
      socket.off(eventName, eventCallback);
      console.log('Unsubscribed from socket events');
    };
    unsubscribe(); // fire and forget, no await
  }
};

const postImages = async <TData>(
  url: string,
  imageData: ImageWithData[],
  upscaledImagesData?: ImageFileData[],
  data?: Record<string, string>
): Promise<AxiosResponse<TData, unknown>> => {
  console.log(
    `Posting ${imageData.length} original images and ${
      upscaledImagesData?.length ?? 0
    } upscaled images...`
  );
  const formData = new FormData();
  imageData.forEach((image) => {
    formData.append('images', toFile(image), image.name);
  });
  if (upscaledImagesData?.length) {
    formData.append('upscaledImagesData', JSON.stringify(upscaledImagesData));
  }
  if (data) {
    for (const [key, value] of Object.entries(data)) {
      console.log(`Data added to request: ${key}: ${value}`);
      formData.append(key, value);
    }
  }
  return await axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const isSuccessResponse = (response: AxiosResponse<unknown, unknown>) =>
  response.status >= 200 && response.status < 300;

export { uploadCsv, upscale, uploadToSftp, getCaptions };
