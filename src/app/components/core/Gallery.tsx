import { ProgressState } from '@components/ProgressLoader';
import { toggleSelection } from '@store/imageSlice';
import { useAppSelector } from '@store/store';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { LoaderOverlay } from './LoaderOverlay';
import { ZoomImage } from './ZoomImage';

type GalleryProps = {
  uploadProgress: Record<string, ProgressState>;
};

const Gallery: FunctionComponent<GalleryProps> = ({ uploadProgress }) => {
  const images = useAppSelector((state) => state.image.images);
  const selectedImages = useAppSelector((state) => state.image.selectedImages);
  const dispatch = useDispatch();

  const toggleImageSelection = (imageName: string) => {
    dispatch(toggleSelection(imageName));
  };

  return (
    <div className="relative">
      <div className="w-full flex gap-3 flex-wrap justify-start max-h-96 overflow-y-auto">
        {images.map((image, index) => {
          const progress = uploadProgress[image.name];
          const isLoading = progress && progress.progress < 1;
          const isUpscaled = image.upscaledUri !== undefined;
          const isSelected = selectedImages.has(image.name);

          return (
            <div key={index}>
              {isLoading ? (
                <LoaderOverlay>
                  <ZoomImage
                    isSelected={isSelected}
                    isUpscaled={isUpscaled}
                    backgroundSrc={image.upscaledUri}
                    src={image.uri}
                    onClick={() => toggleImageSelection(image.name)}
                  />
                </LoaderOverlay>
              ) : (
                <ZoomImage
                  isSelected={isSelected}
                  isUpscaled={isUpscaled}
                  backgroundSrc={image.upscaledUri}
                  src={image.uri}
                  onClick={() => toggleImageSelection(image.name)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { Gallery };
