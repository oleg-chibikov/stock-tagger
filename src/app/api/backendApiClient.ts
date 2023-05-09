import { CaptionEvent } from '@dataTransferTypes/caption';
import { CAPTION_AVAILIABLE, PROGRESS } from '@dataTransferTypes/event';
import { ImageFileData, UploadEvent } from '@dataTransferTypes/upload';
import axios, { AxiosResponse } from 'axios';
import { ImageWithData, toFile } from '../helpers/fileHelper';

// TODO: handle errors in this file and show them in popup

const getCaptions = async (
  onProgress: (event: CaptionEvent) => void,
  imageData: ImageWithData[]
): Promise<boolean> =>
  await postWithEvents<CaptionEvent>(
    '/api/caption',
    '/api/captionEvents',
    CAPTION_AVAILIABLE,
    onProgress,
    imageData
  );

const upscale = async (
  onProgress: (event: UploadEvent) => void,
  imageData: ImageWithData[]
): Promise<boolean> =>
  await postWithEvents<UploadEvent>(
    '/api/upscale',
    '/api/progressEvents',
    PROGRESS,
    onProgress,
    imageData
  );

const uploadToSftp = async (
  onProgress: (event: UploadEvent) => void,
  imageData: ImageWithData[],
  upscaledImagesData?: ImageFileData[]
): Promise<boolean> =>
  await postWithEvents<UploadEvent>(
    '/api/upload',
    '/api/progressEvents',
    PROGRESS,
    onProgress,
    imageData,
    upscaledImagesData
  );

const postWithEvents = async <TData>(
  mainEndpoint: string,
  eventEndpointName: string,
  eventName: string,
  onEvent: (data: TData) => void,
  imageData: ImageWithData[],
  upscaledImagesData?: ImageFileData[]
): Promise<boolean> => {
  // Create a new EventSource to listen for SSE from the events route
  const eventSource = new EventSource(eventEndpointName);

  eventSource.addEventListener(eventName, (event) => {
    const data = JSON.parse(event.data) as TData;
    console.log(`Received ${eventName} event: ${event.data}`);
    onEvent(data);
  });

  try {
    const response = await post(mainEndpoint, imageData, upscaledImagesData);

    if (isSuccessResponse(response)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  } finally {
    eventSource.close();
  }
};

const post = async <TData>(
  url: string,
  imageData: ImageWithData[],
  upscaledImagesData?: ImageFileData[]
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
  return await axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const isSuccessResponse = (response: AxiosResponse<unknown, unknown>) =>
  response.status >= 200 && response.status < 300;

export { upscale, uploadToSftp, getCaptions };
