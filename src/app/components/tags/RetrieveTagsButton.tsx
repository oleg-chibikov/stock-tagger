import { getCaptions } from '@apiClient/backendApiClient';
import { uploadImageAndGetTags } from '@apiClient/imaggaApiClient';
import { Caption } from '@dataTransferTypes/caption';
import { useAppSelector } from '@store/store';
import { setTags } from '@store/tagSlice';
import clsx from 'clsx';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { getUniqueTags } from '../../helpers/tagHelper';
import { Styleable } from '../Styleable';
import { Loader } from '../core/Loader';

interface Props extends Styleable {
  onCaptionRetrieved: (caption: Caption) => void;
  onStart: () => void;
  onFinish: () => void;
}

export function RetrieveTagsButton({
  onCaptionRetrieved,
  onStart,
  onFinish,
  className,
}: Props) {
  const selectedImages = useAppSelector((state) => state.image.selectedImages);
  const images = useAppSelector((state) => state.image.images);
  const [loading, setLoading] = useState(false);
  const tags = useAppSelector((state) => state.tag.tags);
  const dispatch = useDispatch();

  const imagesToUse = selectedImages.length ? selectedImages : [images[0]];

  const retrieveTags = async () => {
    const retrievedTags = [];

    for (const image of imagesToUse) {
      const tags = await uploadImageAndGetTags(image);
      retrievedTags.push(tags);
    }
    const uniqueTags = getUniqueTags(retrievedTags, tags, true);
    dispatch(setTags(uniqueTags));
  };

  const retrieveCaptions = async () => {
    onStart();
    await getCaptions((data) => {
      onCaptionRetrieved(data);
    }, imagesToUse);
    onFinish();
  };

  const handlePress = async () => {
    setLoading(true);
    await Promise.all([retrieveTags(), retrieveCaptions()]);
    setLoading(false);
  };

  return (
    <div className={clsx('flex items-center', className)}>
      <button
        className="disabled:bg-slate-500 bg-teal-500 hover:bg-teal-700 py-2 px-2 w-full"
        onClick={handlePress}
        disabled={loading}
      >
        Retrieve tags and captions
      </button>
      {loading && (
        <div className="ml-2 flex items-center">
          <Loader />
        </div>
      )}
    </div>
  );
}
