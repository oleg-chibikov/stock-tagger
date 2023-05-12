import { uploadCsv } from '@apiClient/backendApiClient';
import { getNotUploadedImages } from '@appHelpers/imageHelper';
import { categories } from '@constants/categories';
import { useAppSelector } from '@store/store';
import { setTags } from '@store/tagSlice';
import clsx from 'clsx';
import { FunctionComponent, useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import {
  createCSVData,
  downloadCSV,
  maxTitleAiLength,
} from '../../helpers/csvHelper';
import { ComboBoxItem } from '../core/ComboBox';
import { LabeledPicker } from '../core/LabeledPicker';
import { NewTag } from '../tags/NewTag';
import { RetrieveTagsButton } from '../tags/RetrieveTagsButton';
import { Tags } from '../tags/Tags';

interface SidePanelProps {
  className?: string;
}

const SidePanel: FunctionComponent<SidePanelProps> = ({ className }) => {
  const tags = useAppSelector((state) => state.tag.tags);
  const images = useAppSelector((state) => state.image.images);
  const newImagesTrigger = useAppSelector(
    (state) => state.image.newImagesTrigger
  );
  const hasTags = tags.length > 0;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<number>();
  const [captions, setCaptions] = useState<ComboBoxItem[]>([]);
  const [isReadyToSubmit, setIsReadyToSumbit] = useState<boolean>(false);
  const [areCaptionsLoading, setAreCaptionsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (images.length && !getNotUploadedImages(images).length) {
      setIsReadyToSumbit(true);
    }
  }, [images]);
  const dispatch = useDispatch();

  useEffect(() => {
    setTitle('');
    setCategory(undefined);
    setCaptions([]);
    setIsReadyToSumbit(false);
  }, [newImagesTrigger]);

  if (!images.length) {
    return null;
  }

  const downloadTags = async () => {
    await downloadCSV(images, tags, title, true, category);
    window
      ?.open('https://contributor.stock.adobe.com/en/uploads', '_blank')
      ?.focus();
  };

  const uploadTagsAndSubmitImages = async () => {
    const csvData = createCSVData(images, tags, title, true, category);
    await uploadCsv(csvData);
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
            onCaptionRetrieved={(captionEvent) => {
              if (!title.length && captionEvent.isFromFileMetadata) {
                setTitle(captionEvent.caption.substring(0, maxTitleAiLength));
              }
              // duplicate captions are not allowed
              if (
                captions.map((x) => x.value).indexOf(captionEvent.caption) < 0
              ) {
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
            }}
          />
          <NewTag />
          {hasTags && (
            <>
              <Tags />
              <button
                onClick={() => {
                  if (confirm('Clear all the tags?')) {
                    dispatch(setTags([]));
                  }
                }}
                className="bg-gray-500 hover:bg-red-600"
              >
                Clear tags
              </button>
              <button onClick={downloadTags}>Download tags</button>

              <div className="flex flex-row gap-2 items-center justify-center">
                <button
                  disabled={!isReadyToSubmit}
                  onClick={uploadTagsAndSubmitImages}
                >
                  Upload tags and submit images to stock
                </button>

                {!isReadyToSubmit && (
                  <button
                    className="w-10 h-10 flex justify-center items-center"
                    title="I want to upload tags anyway (the images are already uploaded to stock)"
                    onClick={() => setIsReadyToSumbit(true)}
                  >
                    <FaCheck />
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export { SidePanel };
