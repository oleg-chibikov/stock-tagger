import { uploadToSftp, upscale } from '@apiClient/backendApiClient';
import {
  ImageWithData,
  getNotUploadedImages,
  getNotUpscaledImages,
  getUpscaledImages,
} from '@appHelpers/imageHelper';
import { HelpIcon } from '@components/core/HelpIcon';
import { ImageFileData, UploadEvent } from '@dataTransferTypes/upload';
import {
  setImages,
  setIsUploadedToFtp,
  setUpscaledUri,
  triggerNewImages,
} from '@store/imageSlice';
import { useAppSelector } from '@store/store';
import { setTags } from '@store/tagSlice';
import clsx from 'clsx';
import { FunctionComponent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Gallery } from '../core/Gallery';
import { ImagePicker } from '../core/ImagePicker';
import { ProgressLoader, ProgressState } from '../core/ProgressLoader';

const messages = [
  'Select the images which you would like to submit to stock.',
  'Upscale them if needed using the Upscale button and upload to stock using the Upload to FTP button.',
  'Unless you select some of the images (click on the image), all of them will be processed.',
  'Click Retrieve tags and captions to get the metadata about the image',
  '(Imagga for tags, CLIP and PNG chunk info for captions)',
  'or enter the caption and tags manually.',
  'Without the selection, only the first image will be used for tag and caption retrieval.',
  'Either download tags as a file and upload/submit the images manually',
  'or click Upload tags button to do the processing automatically using Puppeteer.',
  'You will need a separate Chrome installation (for example, Chrome Canary)',
  'as Puppeteer cannot work with the currently open instance.',
  'Before processing images, log in to the stock website (one-time operation).',
];

interface MainSectionProps {
  className?: string;
}

const MainSection: FunctionComponent<MainSectionProps> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [allAreUpscaled, setAllAreUpscaled] = useState(false);
  const [allAreUploaded, setAllAreUploaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<
    Record<string, ProgressState>
  >({});
  const selectedImages = useAppSelector((state) => state.image.selectedImages);
  const images = useAppSelector((state) => state.image.images);
  const dispatch = useDispatch();

  useEffect(() => {
    if (images.length && !getNotUpscaledImages(images).length) {
      setAllAreUpscaled(true);
    }
    if (images.length && !getNotUploadedImages(images).length) {
      setAllAreUploaded(true);
    }
  }, [images]);

  const processUploadedImages = async (images: ImageWithData[] | null) => {
    if (images) {
      dispatch(setImages(images));
      dispatch(setTags([]));
      setAllAreUpscaled(false);
      dispatch(triggerNewImages());
    }
  };

  const processImages = async (
    operation: (
      onProgress: (event: UploadEvent) => void,
      imageData: ImageWithData[],
      upscaledImagesData?: ImageFileData[]
    ) => Promise<void>,
    filterImage: (image: ImageWithData) => boolean,
    eventAdditionalProcessing?: (data: UploadEvent) => void
  ) => {
    const imagesToProcess = (
      selectedImages.size > 0
        ? images.filter((x) => selectedImages.has(x.name))
        : images
    ).filter(filterImage);
    if (!imagesToProcess.length) {
      return;
    }
    setIsLoading(true);
    try {
      const initialProgress: Record<string, ProgressState> = {};
      for (const image of imagesToProcess) {
        initialProgress[image.name] = {
          progress: 0,
          operation: 'unknown',
        };
      }

      setUploadProgress(initialProgress);
      const upscaledImages = getUpscaledImages(imagesToProcess).map(
        (x) => ({ fileName: x.name, filePath: x.upscaledUri } as ImageFileData)
      );
      const notUpscaledImages = getNotUpscaledImages(imagesToProcess);
      await operation(
        (data) => {
          eventAdditionalProcessing?.(data);
          setUploadProgress((prevUploadProgress) => ({
            ...prevUploadProgress,
            [data.fileName]: data,
          }));
        },
        notUpscaledImages,
        upscaledImages
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={clsx(
        'w-full p-4 bg-gray-800 gap-4 flex flex-col justify-center items-center z-40',
        className
      )}
    >
      {!isLoading && (
        <ImagePicker className="w-full" onSelect={processUploadedImages}>
          <HelpIcon className="z-30" messages={messages} />
        </ImagePicker>
      )}

      <>
        {Boolean(images.length) && (
          <>
            <Gallery uploadProgress={uploadProgress} isLoading={isLoading} />
            {isLoading && <ProgressLoader uploadProgress={uploadProgress} />}
            {!isLoading && (
              <>
                {!allAreUpscaled && (
                  <button
                    onClick={() =>
                      processImages(
                        upscale,
                        (image) => !image.upscaledUri, // upscale only those not upscaled
                        (data) => {
                          if (data.operation === 'upscale_done') {
                            dispatch(setUpscaledUri(data));
                            setAllAreUploaded(false); // if something is upscaled it means it can be re-uploaded
                          }
                        }
                      )
                    }
                  >
                    Upscale
                  </button>
                )}

                <button
                  onClick={() =>
                    processImages(
                      uploadToSftp,
                      (image) => (allAreUploaded ? true : !image.uploadedToFtp), // upload only those not uploaded. However if all are uploaded - reupload everything
                      (data) => {
                        if (data.operation === 'ftp_upload_done') {
                          dispatch(setIsUploadedToFtp(data));
                        }
                      }
                    )
                  }
                >
                  {allAreUploaded ? 'Re-upload to stock' : 'Upload to stock'}
                </button>
              </>
            )}
          </>
        )}
      </>
    </div>
  );
};

export { MainSection };
