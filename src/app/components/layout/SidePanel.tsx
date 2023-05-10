import { categories } from '@constants/categories';
import { useAppSelector } from '@store/store';
import { setTags } from '@store/tagSlice';
import { FunctionComponent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { downloadCSV } from '../../helpers/csvHelper';
import { ComboBoxItem } from '../core/ComboBox';
import { LabeledPicker } from '../core/LabeledPicker';
import { NewTag } from '../tags/NewTag';
import { RetrieveTagsButton } from '../tags/RetrieveTagsButton';
import { Tags } from '../tags/Tags';

interface SidePanelProps {
  className?: string;
}

const SidePanel: FunctionComponent<SidePanelProps> = ({ className = '' }) => {
  const tags = useAppSelector((state) => state.tag.tags);
  const images = useAppSelector((state) => state.image.images);
  const hasTags = tags.length > 0;
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<number>();
  const [captions, setCaptions] = useState<ComboBoxItem[]>([]);
  const [areCaptionsLoading, setAreCaptionsLoading] = useState<boolean>();
  const dispatch = useDispatch();

  if (!images.length) {
    return null;
  }

  const downloadTags = () => {
    downloadCSV(images, tags, title, true, category);
    window
      ?.open('https://contributor.stock.adobe.com/en/uploads', '_blank')
      ?.focus();
  };

  return (
    <div className={`bg-gray-800 p-2 ${className}`}>
      <LabeledPicker
        labelClassName="w-28"
        label="Title"
        value={title}
        onSelect={(value) => setTitle(value as string)}
        items={captions}
        className="mt-2 z-20"
        isLoading={areCaptionsLoading}
      />
      <LabeledPicker
        editable={false}
        labelClassName="w-28"
        label="Category"
        value={category}
        onSelect={(value) => setCategory(value as number)}
        items={categories}
        className="mt-2 z-10"
      />
      {Boolean(images.length) && (
        <>
          <RetrieveTagsButton
            onStart={() => {
              setAreCaptionsLoading(true);
              setCaptions([]);
            }}
            onFinish={() => setAreCaptionsLoading(false)}
            onCaptionRetrieved={(caption) => {
              if (!title.length) {
                setTitle(caption.caption);
              }
              setCaptions((prevState) => [
                ...prevState,
                {
                  label: caption.caption,
                  value: caption.caption,
                },
              ]);
            }}
            className="mt-2"
          />
          <NewTag className="mt-2" />
          {hasTags && (
            <>
              <Tags className="mt-2" />
              <button
                onClick={() => {
                  if (confirm('Clear all the tags?')) {
                    dispatch(setTags([]));
                  }
                }}
                className="w-full mt-2 px-2 py-2 bg-gray-500 hover:bg-red-600"
              >
                Clear tags
              </button>
              <button
                onClick={downloadTags}
                className="w-full mt-2 px-2 py-2 bg-teal-500 hover:bg-teal-600"
              >
                Download tags
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export { SidePanel };
