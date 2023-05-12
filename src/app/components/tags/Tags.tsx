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
    <div className={clsx('flex flex-col gap-2 text-sm', className)}>
      {Boolean(tags.length) && (
        <>
          <h2 className="cursor-help" title="Drag and drop to reorder tags">
            Tags
          </h2>
          <ReactSortable
            list={mappedTags}
            setList={mappedSetTags}
            tag="div"
            className="overflow-y-auto flex flex-1 flex-col gap-2 max-h-80"
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
        </>
      )}
    </div>
  );
};

export { Tags };
