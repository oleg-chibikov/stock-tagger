import { CaptionEvent } from '@dataTransferTypes/caption';
import { CAPTION_AVAILIABLE, PROGRESS } from '@dataTransferTypes/event';
import { ImageFileData, UploadEvent } from '@dataTransferTypes/upload';
import axios, { AxiosResponse } from 'axios';
import { ImageWithData, toFile } from '../helpers/imageHelper';

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
): Promise<void> =>
  await postImagesWithEvents<CaptionEvent>(
    '/api/caption',
    '/api/captionEvents',
    CAPTION_AVAILIABLE,
    onProgress,
    imageData
  );

const upscale = async (
  onProgress: (event: UploadEvent) => void,
  imageData: ImageWithData[]
): Promise<void> =>
  await postImagesWithEvents<UploadEvent>(
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
): Promise<void> =>
  await postImagesWithEvents<UploadEvent>(
    '/api/upload',
    '/api/progressEvents',
    PROGRESS,
    onProgress,
    imageData,
    upscaledImagesData
  );

const postImagesWithEvents = async <TData>(
  mainEndpoint: string,
  eventEndpointName: string,
  eventName: string,
  onEvent: (data: TData) => void,
  imageData: ImageWithData[],
  upscaledImagesData?: ImageFileData[]
): Promise<void> => {
  // Create a new EventSource to listen for SSE from the events route
  const eventSource = new EventSource(eventEndpointName);
  try {
    eventSource.addEventListener(eventName, (event) => {
      const data = JSON.parse(event.data) as TData;
      console.log(`Received ${eventName} event: ${event.data}`);
      onEvent(data);
    });

    const response = await postImages(
      mainEndpoint,
      imageData,
      upscaledImagesData
    );

    if (!isSuccessResponse(response)) {
      throw response.data;
    }
  } finally {
    eventSource.close();
  }
};

const postImages = async <TData>(
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

export { uploadCsv, upscale, uploadToSftp, getCaptions };
