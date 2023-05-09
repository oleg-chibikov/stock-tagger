import { Styleable } from '@components/Styleable';
import clsx from 'clsx';
import Image from 'next/image';
import { FunctionComponent, useEffect, useState } from 'react';

interface ZoomProps extends Styleable {
  src: string;
}

const ZoomImage: FunctionComponent<ZoomProps> = ({ src, className }) => {
  const [backgroundImage, setBackgroundImage] = useState(`url(${src})`);
  const [isHovered, setIsHovered] = useState(false);
  const [backgroundPosition, setBackgroundPosition] = useState('0% 0%');
  useEffect(() => {
    setBackgroundImage(`url(${src})`);
  }, [src]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  return (
    <div
      className={clsx(
        'cursor-move relative inset-0 border-2 border-gray-400',
        isHovered ? 'w-96 h-96' : 'w-24 h-24',
        className
      )}
    >
      {isHovered && (
        <figure
          onMouseLeave={() => {
            setIsHovered(false);
          }}
          className="w-full h-full"
          onMouseMove={handleMouseMove}
          style={{
            backgroundRepeat: 'no-repeat',
            backgroundImage,
            backgroundPosition,
          }}
        />
      )}
      {!isHovered && (
        <Image
          fill={true}
          className="w-full h-full"
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          alt="image"
          src={src}
          style={{ objectFit: 'cover' }}
        />
      )}
    </div>
  );
};

export { ZoomImage };
