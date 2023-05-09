import { useAppSelector } from '@store/store';
import { prependTag } from '@store/tagSlice';
import clsx from 'clsx';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { maxTags } from '../../helpers/tagHelper';
import { Styleable } from '../Styleable';

interface Props extends Styleable {}

export function NewTag({ className }: Props) {
  const dispatch = useDispatch();
  const handlePrependTag = (tag: string) => {
    dispatch(prependTag(tag));
  };
  const [newTag, setNewTag] = useState('');
  const tags = useAppSelector((state) => state.tag.tags);
  const handleAddTag = () => {
    if (newTag) {
      const set = new Set(tags);
      if (!set.has(newTag)) {
        handlePrependTag(newTag.trim());
      }
      setNewTag('');
    }
  };

  const reachedMaxTags = tags.length >= maxTags;
  const isEmpty = !newTag.trim().length;
  return (
    <div className={clsx('flex', className)}>
      <input
        type="text"
        value={newTag}
        onChange={(event) => setNewTag(event.target.value)}
        placeholder="Enter new tag"
        className="w-full p-2 rounded mr-2"
      />
      <button
        className="disabled:bg-slate-500 bg-teal-500 hover:bg-teal-700 py-2 px-2"
        disabled={isEmpty || reachedMaxTags}
        onClick={handleAddTag}
        title={
          reachedMaxTags
            ? `Maximum ${maxTags} tags. Delete tags first to add new`
            : isEmpty
            ? 'Please enter tag'
            : undefined
        }
      >
        Add
      </button>
    </div>
  );
}
