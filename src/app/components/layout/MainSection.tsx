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
import { Loader } from '../core/Loader';

interface MainSectionProps {
  className?: string;
}

const MainSection: FunctionComponent<MainSectionProps> = ({ className }) => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<
    Record<string, ProgressState>
  >({});
  const images = useAppSelector((state) => state.image.images);
  const dispatch = useDispatch();
  const selectImages = async (images: ImageWithData[] | null) => {
    if (images) {
      dispatch(setImages(images));
      dispatch(setTags([]));
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
    setLoading(true);
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
    setLoading(false);
  }

  return (
    <div
      className={`${className} p-2 bg-gray-800 flex flex-col justify-center items-center`}
    >
      <Loader loading={loading} />
      {loading ? (
        <ProgressLoader uploadProgress={uploadProgress} />
      ) : (
        <>
          <ImagePicker className="mb-2" onSelect={selectImages} />
          {Boolean(images.length) && (
            <>
              <Gallery />
              <button
                onClick={() =>
                  processImages(upscale, (data) => {
                    if (data.operation === 'upscale_done') {
                      dispatch(setUpscaledUri(data));
                      // TODO: show error (red border over the image)
                    }
                  })
                }
                className="mt-2 px-2 py-2 bg-teal-500 hover:bg-teal-700"
              >
                Upscale
              </button>
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
                className="mt-2 px-2 py-2 bg-teal-500 hover:bg-teal-700"
              >
                Upload to stock
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export { MainSection };
