import { upscaleAndUploadToStock } from '@apiClient/backendApiClient';
import { ImageWithData } from '@appHelper/fileHelper';
import { setImages } from '@store/imageSlice';
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
  async function processImages() {
    setLoading(true);
    const initialProgress: Record<string, ProgressState> = {};
    for (const image of images) {
      initialProgress[image.name] = {
        progress: 0,
        operation: 'unknown',
      };
    }
    setUploadProgress(initialProgress);
    await upscaleAndUploadToStock(images, (data) => {
      setUploadProgress((prevUploadProgress) => ({
        ...prevUploadProgress,
        [data.fileName]: data,
      }));
    });
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
                onClick={processImages}
                className="mt-2 px-2 py-2 bg-teal-500 hover:bg-teal-700"
              >
                Upscale and upload images to stock
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export { MainSection };
