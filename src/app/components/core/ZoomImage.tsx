import { Styleable } from '@components/core/Styleable';
import { useAppSelector } from '@store/store';
import {
  setBackgroundImage,
  setBackgroundPosition,
  setIsHovered,
  setZoomLevel,
} from '@store/zoomImageSlice';
import clsx from 'clsx';
import Image from 'next/image';
import { FunctionComponent, ReactNode } from 'react';
import { useDispatch } from 'react-redux';

interface ZoomImageProps extends Styleable {
  src: string;
  backgroundSrc?: string;
  onClick: () => void;
  children?: ReactNode;
}

const ZoomImage: FunctionComponent<ZoomImageProps> = ({
  src,
  backgroundSrc,
  className,
  onClick,
  children,
}) => {
  const dispatch = useDispatch();
  const { zoomLevel } = useAppSelector((state) => state.zoomImage);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    dispatch(setBackgroundPosition(`${x}% ${y}%`));
  };

  const handleMouseWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const newZoomLevel = Math.min(Math.max(zoomLevel - e.deltaY * 0.01, 1), 20);
    dispatch(setZoomLevel(newZoomLevel));
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
            dispatch(setBackgroundImage(`url(${backgroundSrc ?? src})`));
          }}
          onMouseLeave={() => {
            dispatch(setIsHovered(false));
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
