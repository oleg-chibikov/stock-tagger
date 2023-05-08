import { useAppSelector } from '@store/store';
import { removeTagAtIndex, setTags } from '@store/tagSlice';
import clsx from 'clsx';
import { FunctionComponent, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ItemInterface, ReactSortable } from 'react-sortablejs';
import { Tag } from './Tag';

interface TagsProps {
  className?: string;
}

const Tags: FunctionComponent<TagsProps> = ({ className }) => {
  const tags = useAppSelector((state) => state.tag.tags);
  const dispatch = useDispatch();

  const [hoveredIndex, setHoveredIndex] = useState<number>();

  const handleRemoveTag = (index: number) => {
    dispatch(removeTagAtIndex(index));
  };

  const mappedTags = tags.map((x) => ({ id: x }));
  const mappedSetTags = (tags: ItemInterface[]) =>
    dispatch(setTags(tags.map((x) => x.id as string)));

  return (
    <div className={clsx(className, 'flex flex-col text-xs')}>
      {Boolean(tags.length) && (
        <>
          <span className="text-lg mb-2">Tags</span>
          <ReactSortable
            list={mappedTags}
            setList={mappedSetTags}
            tag="div"
            className="overflow-y-auto flex-1 max-h-80"
          >
            {tags.map((tag, index) => (
              <Tag
                key={`tag-${tag}-${index}`}
                item={tag}
                index={index}
                handleRemoveTag={handleRemoveTag}
                setHoveredIndex={setHoveredIndex}
                hoveredIndex={hoveredIndex}
                isHovered={index === hoveredIndex}
              />
            ))}
          </ReactSortable>
          <span className="text-sm mt-2">Drag and drop to reorder tags</span>
        </>
      )}
    </div>
  );
};

export { Tags };
