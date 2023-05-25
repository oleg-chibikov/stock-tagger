import { Styleable } from '@components/core/Styleable';
import {
  setBackgroundImage,
  setBackgroundPosition,
  setIsHovered,
  setZoomImageSelected,
  updateZoomLevel,
} from '@store/zoomImageSlice';
import clsx from 'clsx';
import Image from 'next/image';
import { FunctionComponent, ReactNode } from 'react';
import { useDispatch } from 'react-redux';

interface ZoomImageProps extends Styleable {
  name: string;
  src: string;
  backgroundSrc?: string;
  onClick: () => void;
  onMouseEnter: () => void;
  children?: ReactNode;
}

const ZoomImage: FunctionComponent<ZoomImageProps> = ({
  name,
  src,
  backgroundSrc,
  className,
  onClick,
  onMouseEnter,
  children,
}) => {
  const dispatch = useDispatch();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    dispatch(setBackgroundPosition(`${x}% ${y}%`));
  };

  const handleMouseWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    dispatch(updateZoomLevel(e.deltaY));
  };

  return (
    <div
      className={clsx(
        'inset-0 border-2 border-gray-400 w-48 h-48 overflow-hidden',
        className
      )}
      onWheel={handleMouseWheel}
      onMouseMove={handleMouseMove}
    >
      <div className="relative">
        {children}
        <Image
          onClick={onClick}
          width={10}
          height={10}
          className="cursor-move w-48 h-48"
          onMouseEnter={() => {
            dispatch(setIsHovered(true));
            dispatch(
              setBackgroundImage({
                src: `url(${backgroundSrc ?? src})`,
                name: name,
              })
            );
            onMouseEnter();
          }}
          onMouseLeave={() => {
            dispatch(setIsHovered(false));
            dispatch(setZoomImageSelected(false));
          }}
          alt="image"
          src={src}
          style={{ objectFit: 'cover' }}
        />
      </div>
    </div>
  );
};

export { ZoomImage };
