import { maxTitleAiLength } from '@appHelpers/csvHelper';
import { ClearTagsButton } from '@components/ClearButton';
import {
  DownloadTagsButton,
  TagsButtonProps,
} from '@components/DownloadButton';
import { NewTag } from '@components/NewTag';
import { RetrieveTagsButton } from '@components/RetrieveTagsButton';
import { SubmitButton } from '@components/SubmitButton';
import { Tags } from '@components/Tags';
import { ComboBoxItem } from '@components/core/ComboBox';
import { LabeledPicker } from '@components/core/LabeledPicker';
import { categories } from '@constants/categories';
import { CaptionEvent } from '@dataTransferTypes/caption';
import { useAppSelector } from '@store/store';
import clsx from 'clsx';
import { FunctionComponent, useEffect, useMemo, useState } from 'react';

interface SidePanelProps {
  className?: string;
}

const SidePanel: FunctionComponent<SidePanelProps> = ({ className }) => {
  const tags = useAppSelector((state) => state.tag.tags);
  const imagesMap = useAppSelector((state) => state.image.images);
  const images = useMemo(
    () => Array.from(imagesMap).map((x) => x[1]),
    [imagesMap]
  );
  const newImagesTrigger = useAppSelector(
    (state) => state.image.newImagesTrigger
  );
  const hasTags = tags.length > 0;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<number>();
  const [captions, setCaptions] = useState<ComboBoxItem[]>([]);
  const [areCaptionsLoading, setAreCaptionsLoading] = useState<boolean>(false);

  useEffect(() => {
    setTitle('');
    setCategory(undefined);
    setCaptions([]);
  }, [newImagesTrigger]);

  if (!images.length) {
    return null;
  }

  const onCaptionRetrieved = (captionEvent: CaptionEvent) => {
    if (!title.length && captionEvent.isFromFileMetadata) {
      setTitle(captionEvent.caption.substring(0, maxTitleAiLength));
    }
    // duplicate captions are not allowed
    if (captions.map((x) => x.value).indexOf(captionEvent.caption) < 0) {
      setCaptions((prevState) => {
        return [
          ...prevState,
          {
            label: captionEvent.caption,
            value: captionEvent.caption,
          },
        ];
      });
    }
  };

  const buttonProps: TagsButtonProps = {
    images,
    tags,
    title,
    category,
  };

  return (
    <div className={clsx('bg-gray-800 flex flex-col gap-4 p-4', className)}>
      <LabeledPicker
        labelClassName="w-28"
        label="Title"
        value={title}
        onSelect={(value) =>
          setTitle((value as string).substring(0, maxTitleAiLength))
        }
        items={captions}
        maxLength={maxTitleAiLength}
        className="z-20"
        isLoading={areCaptionsLoading}
        rows={3}
        isResizable={true}
      />
      <LabeledPicker
        editable={false}
        labelClassName="w-28"
        label="Category"
        value={category}
        onSelect={(value) => setCategory(value as number)}
        items={categories}
        className="z-10"
      />
      {Boolean(images.length) && (
        <>
          <RetrieveTagsButton
            onStart={() => {
              setAreCaptionsLoading(true);
              setCaptions([]);
            }}
            onFinish={() => setAreCaptionsLoading(false)}
            onCaptionRetrieved={onCaptionRetrieved}
          />
          <NewTag />
          {hasTags && (
            <>
              <Tags />
              <ClearTagsButton />
              <DownloadTagsButton {...buttonProps} />
              <SubmitButton {...buttonProps} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export { SidePanel };
