import { uploadToSftp, upscale } from '@apiClient/backendApiClient';
import { ImageWithData } from '@appHelper/fileHelper';
import { ImageFileData, UploadEvent } from '@dataTransferTypes/upload';
import { setImages, setUpscaledUri } from '@store/imageSlice';
import { useAppSelector } from '@store/store';
import { setTags } from '@store/tagSlice';
import { FunctionComponent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ProgressLoader, ProgressState } from '../ProgressLoader';
import { Gallery } from '../core/Gallery';
import { ImagePicker } from '../core/ImagePicker';

interface MainSectionProps {
  className?: string;
}

const MainSection: FunctionComponent<MainSectionProps> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpscaled, setIsUpscaled] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<
    Record<string, ProgressState>
  >({});
  const images = useAppSelector((state) => state.image.images);
  const dispatch = useDispatch();
  const selectImages = async (images: ImageWithData[] | null) => {
    if (images) {
      dispatch(setImages(images));
      dispatch(setTags([]));
      setIsUpscaled(false);
    }
  };
  async function processImages(
    operation: (
      onProgress: (event: UploadEvent) => void,
      imageData: ImageWithData[],
      upscaledImagesData?: ImageFileData[]
    ) => Promise<boolean>,
    eventAdditionalProcessing?: (data: UploadEvent) => void
  ) {
    setIsLoading(true);
    const initialProgress: Record<string, ProgressState> = {};
    for (const image of images) {
      initialProgress[image.name] = {
        progress: 0,
        operation: 'unknown',
      };
    }
    setUploadProgress(initialProgress);
    const upscaledImages = images
      .filter((x) => x.upscaledUri)
      .map(
        (x) => ({ fileName: x.name, filePath: x.upscaledUri } as ImageFileData)
      );
    const notUpscaledImages = images.filter((x) => !x.upscaledUri);
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
    setIsLoading(false);
  }

  return (
    <div
      className={`${className} w-full p-4 bg-gray-800 flex flex-col justify-center items-center z-40`}
    >
      {!isLoading && (
        <ImagePicker className="w-full mb-2" onSelect={selectImages} />
      )}

      <>
        {Boolean(images.length) && (
          <>
            <Gallery uploadProgress={uploadProgress} />
            {isLoading && <ProgressLoader uploadProgress={uploadProgress} />}
            {!isLoading && (
              <>
                {!isUpscaled && (
                  <button
                    onClick={() =>
                      processImages(upscale, (data) => {
                        if (data.operation === 'upscale_done') {
                          dispatch(setUpscaledUri(data));
                          setIsUpscaled(true);
                          // TODO: show error (red border over the image)
                        }
                      })
                    }
                    className="w-full mt-2 px-2 py-2 bg-teal-500 hover:bg-teal-700"
                  >
                    Upscale
                  </button>
                )}
                <button
                  onClick={() =>
                    processImages(uploadToSftp, (data) => {
                      if (
                        data.operation === 'ftp_upload_done' ||
                        data.operation === 'ftp_upload_error'
                      ) {
                        // TODO: show error (red border over the image)
                        dispatch(setUpscaledUri(data)); // the path will be undefined, so it should erase upscale_url
                      }
                    })
                  }
                  className="w-full mt-2 px-2 py-2 bg-teal-500 hover:bg-teal-700"
                >
                  Upload to stock
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
