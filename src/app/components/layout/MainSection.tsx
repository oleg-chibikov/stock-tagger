import { uploadToSftp, upscale } from '@apiClient/backendApiClient';
import {
  ImageWithData,
  getNotUploadedImages,
  getNotUpscaledImages,
  getUpscaledImages,
} from '@appHelpers/imageHelper';
import { ComboBox } from '@components/core/ComboBox';
import { HelpIcon } from '@components/core/HelpIcon';
import { Styleable } from '@components/core/Styleable';
import { ImageFileData } from '@dataTransferTypes/imageFileData';
import { Operation } from '@dataTransferTypes/operation';
import { UploadEvent } from '@dataTransferTypes/uploadEvent';
import { UpscaleModel } from '@dataTransferTypes/upscaleModel';
import {
  resetIsUploadedToFtp,
  setAllAreUploaded,
  setAllAreUpscaled,
  setIsUploadedToFtp,
  setUpscaledUri,
} from '@store/imageSlice';
import { useAppSelector } from '@store/store';
import clsx from 'clsx';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Gallery } from '../core/Gallery';
import { ImagePicker } from '../core/ImagePicker';
import { ProgressLoader, ProgressState } from '../core/ProgressLoader';

const messages = [
  'Select the images which you would like to submit to stock.',
  'You can also drop the images anywhere on the screen',
  'Upscale them if needed using the Upscale button',
  'and upload to stock using the Upload to FTP button.',
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

interface MainSectionProps extends Styleable {
  processUploadedFiles: (files: FileList | null) => Promise<void>;
}

const MainSection: FunctionComponent<MainSectionProps> = ({
  processUploadedFiles,
  className,
}) => {
  const [upscaleModel, setUpscaleModel] =
    useState<UpscaleModel>('RealESRGAN_x4plus');
  const [operation, setOperation] = useState<Operation>('unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<
    Record<string, ProgressState>
  >({});
  const allAreUpscaled = useAppSelector((state) => state.image.allAreUpscaled);
  const allAreUploaded = useAppSelector((state) => state.image.allAreUploaded);
  const selectedImages = useAppSelector((state) => state.image.selectedImages);
  const imagesMap = useAppSelector((state) => state.image.images);
  const images = useMemo(
    () => Array.from(imagesMap).map((x) => x[1]),
    [imagesMap]
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (images.length && !getNotUpscaledImages(images).length) {
      dispatch(setAllAreUpscaled(true));
    }
    if (images.length && !getNotUploadedImages(images).length) {
      dispatch(setAllAreUploaded(true));
    }
  }, [dispatch, images]);

  const processImages = async (
    operation: Operation,
    action: (
      onProgress: (event: UploadEvent) => void,
      imageData: ImageWithData[]
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
    setOperation(operation);
    setIsLoading(true);
    try {
      const initialProgress: Record<string, ProgressState> = {};
      for (const image of imagesToProcess) {
        dispatch(resetIsUploadedToFtp(image.name));
        initialProgress[image.name] = {
          progress: 0,
          operationStatus: 'unknown',
        };
      }

      setUploadProgress(initialProgress);
      await action((data) => {
        eventAdditionalProcessing?.(data);
        setUploadProgress((prevUploadProgress) => ({
          ...prevUploadProgress,
          [data.fileName]: data,
        }));
      }, imagesToProcess);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpscale = () =>
    processImages(
      'upscale',
      (onProgress, imageData) => {
        const dataToProcess = allAreUpscaled
          ? imageData
          : getNotUpscaledImages(imageData);

        return upscale(onProgress, dataToProcess, upscaleModel);
      },
      (image) => (allAreUpscaled ? true : !image.upscaledUri), // upscale only those not upscaled
      (data) => {
        if (data.operationStatus === 'upscale_done') {
          dispatch(setUpscaledUri(data));
          setAllAreUploaded(false); // if something is upscaled it means it can be re-uploaded
        }
      }
    );

  const handleUploadToStock = () =>
    processImages(
      'ftp_upload',
      (onProgress, imageData) => {
        const notUpscaledImages = getNotUpscaledImages(imageData);
        const upscaledImages = getUpscaledImages(imageData).map(
          (x) =>
            ({
              fileName: x.name,
              filePath: x.upscaledUri,
            } as ImageFileData)
        );
        return uploadToSftp(onProgress, notUpscaledImages, upscaledImages);
      },
      (image) => (allAreUploaded ? true : !image.uploadedToFtp), // upload only those not uploaded. However if all are uploaded - reupload everything
      (data) => {
        if (data.operationStatus === 'ftp_upload_done') {
          dispatch(setIsUploadedToFtp(data));
        }
      }
    );

  return (
    <div
      className={clsx(
        'w-full h-full p-4 bg-gray-800 gap-4 flex flex-col z-40',
        className
      )}
    >
      {!isLoading && (
        <ImagePicker className="w-full" onSelect={processUploadedFiles}>
          <HelpIcon className="z-30" messages={messages} />
        </ImagePicker>
      )}

      <>
        {Boolean(images.length) && (
          <>
            <Gallery
              className="flex-grow"
              uploadProgress={uploadProgress}
              isLoading={isLoading}
            />
            {isLoading && (
              <ProgressLoader
                uploadProgress={uploadProgress}
                operation={operation}
              />
            )}
            {!isLoading && (
              <>
                <div className="w-full flex flex-row gap-2">
                  <button
                    className={allAreUpscaled ? 'bg-gray-500' : undefined}
                    onClick={handleUpscale}
                  >
                    {allAreUpscaled ? 'Re-' : ''}Upscale
                  </button>
                  <ComboBox
                    className="w-80"
                    value={upscaleModel}
                    onSelect={(value) => {
                      setUpscaleModel(value as UpscaleModel);
                    }}
                    items={[
                      { label: 'Real ESRGAN 4x', value: 'RealESRGAN_x4plus' },
                      {
                        label: 'Real ESRGAN 4x Anime',
                        value: 'RealESRGAN_x4plus_anime_6B',
                      },
                      {
                        label: 'ESRGAN 4x',
                        value: 'ESRGAN_SRx4',
                      },
                    ]}
                  />
                </div>

                <button
                  className={allAreUploaded ? 'bg-gray-500' : undefined}
                  onClick={handleUploadToStock}
                >
                  {allAreUploaded ? 'Re-' : ''}Upload to stock
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
