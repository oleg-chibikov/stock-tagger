import { cancelOperations, getCaptions } from '@apiClient/backendApiClient';
import { uploadImageAndGetTags } from '@apiClient/imaggaApiClient';
import { getUniqueTags } from '@appHelpers/tagHelper';
import { Loader } from '@components/core/Loader';
import { Styleable } from '@components/core/Styleable';
import { CaptionEvent } from '@dataTransferTypes/caption';
import { useAppSelector } from '@store/store';
import { setTags } from '@store/tagSlice';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

interface Props extends Styleable {
  onCaptionRetrieved: (caption: CaptionEvent) => void;
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
  const imagesMap = useAppSelector((state) => state.image.images);
  const images = useMemo(
    () => Array.from(imagesMap).map((x) => x[1]),
    [imagesMap]
  );
  const [isLoading, setIsLoading] = useState(false);
  const tags = useAppSelector((state) => state.tag.tags);
  const dispatch = useDispatch();

  const imagesToUse = selectedImages.size
    ? images.filter((x) => selectedImages.has(x.name))
    : [images[0]];

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
    setIsLoading(true);
    await Promise.allSettled([retrieveTags(), retrieveCaptions()]);

    setIsLoading(false);
  };

  return (
    <div className={clsx('flex gap-2 flex-row  items-center', className)}>
      <button onClick={handlePress} disabled={isLoading}>
        Retrieve tags and captions
      </button>
      {isLoading && (
        <>
          <Loader />
          <button
            className="icon cancel"
            title="Cancel"
            onClick={() => cancelOperations('caption')}
          >
            <FaTimes />
          </button>
        </>
      )}
    </div>
  );
}
