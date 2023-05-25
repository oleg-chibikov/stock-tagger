import { toggleSelection } from '@store/imageSlice';
import { useAppSelector } from '@store/store';
import {
  setBackgroundPosition,
  setIsHovered,
  toggleZoomImageSelection,
  updateZoomLevel,
} from '@store/zoomImageSlice';
import { FunctionComponent } from 'react';
import { useDispatch } from 'react-redux';
import { SelectedImageMarker } from './ImageMarkers';

const ZoomImageDisplay: FunctionComponent = () => {
  const dispatch = useDispatch();
  const {
    backgroundImage,
    isHovered,
    backgroundPosition,
    zoomLevel,
    isSelected,
  } = useAppSelector((state) => state.zoomImage);

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

  if (!isHovered) {
    return null;
  }

  return (
    <figure
      onWheel={handleMouseWheel}
      className="bg-slate-900 border-solid border-8 border-white border-spacing-2 opacity-95 fixed top-10 left-10 w-1/2 h-3/4 z-50"
      onMouseLeave={() => {
        dispatch(setIsHovered(false));
      }}
      onMouseEnter={() => {
        dispatch(setIsHovered(true));
      }}
      onMouseMove={handleMouseMove}
      onClick={() => {
        dispatch(toggleZoomImageSelection());
        backgroundImage && dispatch(toggleSelection(backgroundImage.name));
      }}
      style={{
        backgroundRepeat: 'no-repeat',
        backgroundImage: backgroundImage?.src,
        backgroundPosition,
        backgroundSize: `${zoomLevel * 100}%`,
      }}
    >
      <SelectedImageMarker isActive={isSelected} />
    </figure>
  );
};

export { ZoomImageDisplay };
