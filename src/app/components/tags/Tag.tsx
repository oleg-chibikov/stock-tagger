import clsx from 'clsx';
import { FunctionComponent } from 'react';
import { FaTimes } from 'react-icons/fa';

interface TagProps {
  item: string;
  index: number;
  handleRemoveTag: (index: number) => void;
  hoveredIndex: number | undefined;
  setHoveredIndex: (index: number | undefined) => void;
  isActive: boolean;
}

const Tag: FunctionComponent<TagProps> = ({
  item,
  index,
  handleRemoveTag,
  hoveredIndex,
  setHoveredIndex,
  isActive,
}) => {
  return (
    <div className="flex items-center cursor-pointer">
      <div
        className={clsx(
          'flex-1 py-1 px-3',
          isActive ? 'bg-sky-900' : 'bg-gray-500'
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
      <button
        className={clsx(
          'rounded-r p-1 focus:outline-none transition-colors',
          index === hoveredIndex ? 'text-white' : 'text-red'
        )}
        onClick={() => handleRemoveTag(index)}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(undefined)}
      >
        <FaTimes size={24} color="currentColor" />
      </button>
    </div>
  );
};

export { Tag };
