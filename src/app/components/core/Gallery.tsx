import { ProgressState } from '@components/core/ProgressLoader';
import { Styleable } from '@components/core/Styleable';
import { toggleSelection } from '@store/imageSlice';
import { useAppSelector } from '@store/store';
import {
  setZoomImageSelected,
  toggleZoomImageSelection,
} from '@store/zoomImageSlice';
import clsx from 'clsx';
import { FunctionComponent, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { SelectedImageMarker, UpscaledImageMarker } from './ImageMarkers';
import { LoaderOverlay } from './LoaderOverlay';
import { ZoomImage } from './ZoomImage';

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
    dispatch(toggleZoomImageSelection());
  };

  return (
    <div className={clsx('overflow-y-auto relative', className)}>
      <div className="w-full flex gap-2 flex-wrap justify-start">
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
            <>
              <SelectedImageMarker isActive={isSelected} />
              <UpscaledImageMarker isActive={isUpscaled} />
            </>
          );

          let className: string | undefined;
          if (isError) {
            className = 'border-red-500 border-8';
          } else if (isUploadedToFtp) {
            className = 'border-green-500 border-8';
          }

          const zoomImage = (
            <ZoomImage
              name={image.name}
              backgroundSrc={image.upscaledUri}
              src={image.uri}
              onClick={() => toggleImageSelection(image.name)}
              onMouseEnter={() => {
                dispatch(setZoomImageSelected(isSelected));
              }}
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
