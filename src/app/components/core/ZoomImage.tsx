import { Styleable } from '@components/Styleable';
import clsx from 'clsx';
import Image from 'next/image';
import { FunctionComponent, useEffect, useState } from 'react';

interface ZoomProps extends Styleable {
  src: string;
  backgroundSrc?: string;
  isUpscaled: boolean;
  isSelected: boolean;
  onClick: () => void;
}

const ZoomImage: FunctionComponent<ZoomProps> = ({
  src,
  backgroundSrc,
  isSelected,
  isUpscaled,
  className,
  onClick,
}) => {
  const [backgroundImage, setBackgroundImage] = useState(`url(${src})`);
  const [isHovered, setIsHovered] = useState(false);
  const [backgroundPosition, setBackgroundPosition] = useState('0% 0%');
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setBackgroundImage(`url(${backgroundSrc ?? src})`);
  }, [src, backgroundSrc]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  const handleMouseWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const newZoomLevel = Math.min(Math.max(zoomLevel - e.deltaY * 0.01, 1), 20);
    setZoomLevel(newZoomLevel);
  };

  return (
    <div
      className={clsx(
        'inset-0 border-2 border-gray-400 w-48 h-48 overflow-hidden',
        className
      )}
      onWheel={handleMouseWheel}
    >
      <div className="relative">
        {isSelected && (
          <div className="absolute top-3 right-3 w-6 h-6 flex justify-center items-center bg-white rounded-full border-black border-2">
            <span className="text-black font-bold">✓</span>
          </div>
        )}
        {isUpscaled && (
          <div className="absolute top-3 left-3 w-6 h-6 flex justify-center items-center bg-white rounded-full border-black border-2">
            <span className="text-black font-bold">U</span>
          </div>
        )}
        <Image
          onClick={onClick}
          width={10}
          height={10}
          className="cursor-move w-48 h-48"
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
          alt="image"
          src={src}
          style={{ objectFit: 'cover' }}
        />
      </div>
      {isHovered && (
        <figure
          className="border-solid border-8 border-white border-spacing-2 top-0 opacity-95 absolute w-96 h-96 z-10"
          onClick={onClick}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          onMouseMove={handleMouseMove}
          style={{
            backgroundRepeat: 'no-repeat',
            backgroundImage,
            backgroundPosition,
            backgroundSize: `${zoomLevel * 100}%`,
          }}
        />
      )}
    </div>
  );
};

export { ZoomImage };
