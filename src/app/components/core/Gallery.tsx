import { setSelectedImages } from '@store/imageSlice';
import { useAppSelector } from '@store/store';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { ImageWithData } from '../../helpers/fileHelper';
import { ZoomImage } from './ZoomImage';

const Gallery: FunctionComponent = ({}) => {
  const images = useAppSelector((state) => state.image.images);
  const selectedImages = useAppSelector((state) => state.image.selectedImages);
  const dispatch = useDispatch();

  function toggleImageSelection(image: ImageWithData) {
    if (selectedImages.includes(image)) {
      dispatch(
        setSelectedImages(selectedImages.filter((img) => img !== image))
      );
    } else {
      dispatch(setSelectedImages([...selectedImages, image]));
    }
  }

  return (
    <div className="flex gap-3 flex-wrap justify-center max-h-96 overflow-y-auto">
      {images.map((image, index) => {
        return (
          <div key={index} onClick={() => toggleImageSelection(image)}>
            <ZoomImage backgroundSrc={image.upscaledUri} src={image.uri} />
            {selectedImages.includes(image) && (
              <div className="absolute top-0 right-0 w-6 h-6 flex justify-center items-center bg-white rounded-full border-black border-2">
                <span className="text-black font-bold">✓</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export { Gallery };
