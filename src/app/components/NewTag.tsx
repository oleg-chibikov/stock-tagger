import { maxTags } from '@appHelpers/tagHelper';
import { Styleable } from '@components/core/Styleable';
import { useAppSelector } from '@store/store';
import { prependTag } from '@store/tagSlice';
import clsx from 'clsx';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

interface Props extends Styleable {}

const NewTag = ({ className }: Props) => {
  const dispatch = useDispatch();
  const [newTag, setNewTag] = useState('');
  const tags = useAppSelector((state) => state.tag.tags);
  const reachedMaxTags = tags.length >= maxTags;
  const isEmpty = !newTag.trim().length;

  const handleAddTag = () => {
    if (newTag && !isEmpty && !reachedMaxTags) {
      dispatch(prependTag(newTag));
      setNewTag('');
    }
  };

  return (
    <div className={clsx('flex', className)}>
      <input
        disabled={reachedMaxTags}
        type="text"
        value={newTag}
        onChange={(event) => setNewTag(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleAddTag();
          }
        }}
        placeholder="Enter new tag"
        className="w-full p-2 rounded mr-2"
      />
      <button
        disabled={isEmpty || reachedMaxTags}
        onClick={handleAddTag}
        title={
          reachedMaxTags
            ? `Maximum ${maxTags} tags. Delete tags first to add new`
            : isEmpty
            ? 'Please enter a tag'
            : undefined
        }
      >
        Add
      </button>
    </div>
  );
};

export { NewTag };
