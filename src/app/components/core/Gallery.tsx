import { ProgressState } from '@components/core/ProgressLoader';
import { Styleable } from '@components/core/Styleable';
import { toggleSelection } from '@store/imageSlice';
import { useAppSelector } from '@store/store';
import clsx from 'clsx';
import { FunctionComponent, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { LoaderOverlay } from './LoaderOverlay';
import { ZoomImage } from './ZoomImage';

interface ImageMarkersProps {
  isSelected: boolean;
  isUpscaled: boolean;
}

const ImageMarkers: FunctionComponent<ImageMarkersProps> = ({
  isSelected,
  isUpscaled,
}) => (
  <>
    {isSelected && (
      <div className="absolute top-3 right-3 w-6 h-6 flex justify-center items-center bg-white rounded-full border-black border-2">
        <span className="text-black font-bold">✓</span>
      </div>
    )}
    {isUpscaled && (
      <div className="absolute top-3 left-3 w-6 h-6 flex justify-center items-center bg-white rounded-full border-black border-2">
        <span className="text-black font-bold">U</span>
      </div>
    )}
  </>
);

const errorStates = ['ftp_upload_error', 'upscale_error'];
const doneStates = ['ftp_upload_done', 'upscale_done'];

interface GalleryProps extends Styleable {
  uploadProgress: Record<string, ProgressState>;
  isLoading: boolean;
}

const Gallery: FunctionComponent<GalleryProps> = ({
  uploadProgress,
  className,
  isLoading,
}) => {
  const imagesMap = useAppSelector((state) => state.image.images);
  const images = useMemo(
    () => Array.from(imagesMap).map((x) => x[1]),
    [imagesMap]
  );
  const selectedImages = useAppSelector((state) => state.image.selectedImages);
  const dispatch = useDispatch();

  const toggleImageSelection = (imageName: string) => {
    dispatch(toggleSelection(imageName));
  };

  return (
    <div className={clsx('relative', className)}>
      <div className="w-full flex gap-2 flex-wrap justify-start max-h-96 overflow-y-auto">
        {images.map((image, index) => {
          const progress = uploadProgress[image.name];
          const isError = progress
            ? errorStates.includes(progress.operationStatus)
            : false;
          const isCurrentOperationFinished = progress
            ? doneStates.includes(progress.operationStatus)
            : false;
          const showLoading =
            isLoading &&
            progress &&
            progress.progress < 1 &&
            !isError &&
            !isCurrentOperationFinished;
          const isUpscaled = image.upscaledUri !== undefined;
          const isSelected = selectedImages.has(image.name);
          const isUploadedToFtp = image.uploadedToFtp;

          const children = (
            <ImageMarkers isSelected={isSelected} isUpscaled={isUpscaled} />
          );

          let className: string | undefined;
          if (isError) {
            className = 'border-red-500 border-8';
          } else if (isUploadedToFtp) {
            className = 'border-green-500 border-8';
          }

          const zoomImage = (
            <ZoomImage
              isSelected={isSelected}
              isUpscaled={isUpscaled}
              backgroundSrc={image.upscaledUri}
              src={image.uri}
              onClick={() => toggleImageSelection(image.name)}
              className={className}
            >
              {children}
            </ZoomImage>
          );

          return (
            <div key={index}>
              {showLoading ? (
                <LoaderOverlay>{zoomImage}</LoaderOverlay>
              ) : (
                zoomImage
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { Gallery };
