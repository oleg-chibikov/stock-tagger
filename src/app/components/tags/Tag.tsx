import clsx from 'clsx';
import { FunctionComponent } from 'react';
import { FaTimes } from 'react-icons/fa';

interface TagProps {
  item: string;
  index: number;
  handleRemoveTag: (index: number) => void;
  hoveredIndex: number | undefined;
  setHoveredIndex: (index: number | undefined) => void;
  isHovered: boolean;
}

const Tag: FunctionComponent<TagProps> = ({
  item,
  index,
  handleRemoveTag,
  hoveredIndex,
  setHoveredIndex,
  isHovered,
}) => {
  return (
    <div className="flex gap-2 items-center cursor-pointer">
      <div
        className={clsx(
          'flex-1 py-1 px-3 hover:bg-zinc-900',
          isHovered ? 'bg-red-500' : 'bg-teal-900'
        )}
        draggable
      >
        <span
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
          className="text-center"
        >
          {item}
        </span>
      </div>
      <div
        className={clsx(
          'rounded-r focus:outline-none transition-colors',
          index !== hoveredIndex ? 'text-white' : 'text-red-500'
        )}
        onClick={() => handleRemoveTag(index)}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(undefined)}
      >
        <FaTimes size={24} color="currentColor" />
      </div>
    </div>
  );
};

export { Tag };
