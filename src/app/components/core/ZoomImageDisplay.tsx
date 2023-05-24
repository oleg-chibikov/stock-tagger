import { useAppSelector } from '@store/store';
import {
  setBackgroundPosition,
  setIsHovered,
  setZoomLevel,
} from '@store/zoomImageSlice';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';

const ZoomImageDisplay: FunctionComponent = () => {
  const dispatch = useDispatch();
  const { backgroundImage, isHovered, backgroundPosition, zoomLevel } =
    useAppSelector((state) => state.zoomImage);

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

  if (!isHovered) {
    return null;
  }

  return (
    <figure
      onWheel={handleMouseWheel}
      className="bg-slate-900 border-solid border-8 border-white border-spacing-2 opacity-95 fixed m-auto top-0 bottom-0 left-0 right-0 w-1/2 h-3/4 z-50"
      onMouseLeave={() => {
        dispatch(setIsHovered(false));
      }}
      onMouseEnter={() => {
        dispatch(setIsHovered(true));
      }}
      onMouseMove={handleMouseMove}
      style={{
        backgroundRepeat: 'no-repeat',
        backgroundImage,
        backgroundPosition,
        backgroundSize: `${zoomLevel * 100}%`,
      }}
    />
  );
};

export { ZoomImageDisplay };
