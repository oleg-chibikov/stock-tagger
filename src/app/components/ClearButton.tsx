import { setTags } from '@store/tagSlice';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

type ClearTagsButtonProps = {};

export const ClearTagsButton: FunctionComponent<ClearTagsButtonProps> = () => {
  const dispatch = useDispatch();

  const handleClearTags = () => {
    if (window.confirm('Clear all the tags?')) {
      dispatch(setTags());
    }
  };

  return (
    <button onClick={handleClearTags} className="bg-slate-500 hover:bg-red-600">
      Clear tags
    </button>
  );
};
