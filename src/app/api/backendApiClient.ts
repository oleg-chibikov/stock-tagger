import { CaptionEvent } from '@dataTransferTypes/caption';
import { CAPTION_AVAILIABLE, PROGRESS } from '@dataTransferTypes/event';
import { UploadEvent } from '@dataTransferTypes/upload';
import axios, { AxiosResponse } from 'axios';
import { ImageWithData, toFile } from '../helpers/fileHelper';

// TODO: handle errors in this file and show them in popup

const getCaptions = async (
  imageData: ImageWithData[],
  onProgress: (event: CaptionEvent) => void
): Promise<boolean> =>
  await postWithEvents<CaptionEvent>(
    '/api/caption',
    '/api/captionEvents',
    imageData,
    CAPTION_AVAILIABLE,
    onProgress
  );

const upscaleAndUploadToStock = async (
  imageData: ImageWithData[],
  onProgress: (event: UploadEvent) => void
): Promise<boolean> =>
  await postWithEvents<UploadEvent>(
    '/api/upload',
    '/api/progressEvents',
    imageData,
    PROGRESS,
    onProgress
  );

const postWithEvents = async <TData>(
  mainEndpoint: string,
  eventEndpointName: string,
  imageData: ImageWithData[],
  eventName: string,
  onEvent: (data: TData) => void
): Promise<boolean> => {
  // Create a new EventSource to listen for SSE from the events route
  const eventSource = new EventSource(eventEndpointName);

  // Set up an event listener for the progress event
  eventSource.addEventListener(eventName, (event) => {
    const data = JSON.parse(event.data) as TData;
    console.log(`Received ${eventName} event: ${event.data}`);
    onEvent(data);
  });

  try {
    const response = await post(mainEndpoint, imageData);

    // handle successful response
    if (isSuccessResponse(response)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    // handle error
    console.error(error);
    return false;
  } finally {
    // Close the EventSource when the request is complete or if an error occurs
    eventSource.close();
  }
};

const post = async <TData>(
  url: string,
  imageData: ImageWithData[]
): Promise<AxiosResponse<TData, unknown>> => {
  const formData = new FormData();
  imageData.forEach((image) => {
    formData.append('images', toFile(image), image.name);
  });
  return await axios.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const isSuccessResponse = (response: AxiosResponse<unknown, unknown>) =>
  response.status >= 200 && response.status < 300;

export { upscaleAndUploadToStock, getCaptions };
