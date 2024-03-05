'use client';
import { withSocket } from '@apiClient/withSocket';
import { ZoomImageDisplay } from '@components/core/ZoomImageDisplay';
import {
  setAllAreUploaded,
  setAllAreUpscaled,
  setImages,
} from '@store/imageSlice';
import { store } from '@store/store';
import { setTags } from '@store/tagSlice';
import { FunctionComponent } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { getImageData } from '../../../helpers/imageHelper';
import { MainSection } from './MainSection';
import { SidePanel } from './SidePanel';

const imageExtensions: string[] = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];

const Layout: FunctionComponent = () => (
  <Provider store={store}>
    <InnerLayout />
  </Provider>
);

const InnerLayout: FunctionComponent = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });
  const dispatch = useDispatch();

  const containerStyles = `
    flex
    gap-2
    ${isSmallScreen ? 'flex-col' : 'flex-row'}
    items-start
    p-${isSmallScreen ? '4' : '8'}
    bg-gray-900
    h-screen
    overflow-x-hidden
    select-none
  `;

  const processUploadedFiles = async (files: FileList | null) => {
    if (files) {
      const images = Array.from(files).filter((file) => {
        const lowerCaseFile = file.name.toLowerCase();
        return imageExtensions.some((extension) =>
          lowerCaseFile.endsWith(extension)
        );
      });
      if (images.length) {
        const selectedImageData = await Promise.all(images.map(getImageData));
        if (selectedImageData) {
          dispatch(setImages(selectedImageData));
          dispatch(setTags());
          dispatch(setAllAreUpscaled(false));
          dispatch(setAllAreUploaded(false));
        }
        return;
      }
    }
  };

  return (
    <div className={containerStyles}>
      <ZoomImageDisplay />
      <MainSection processUploadedFiles={processUploadedFiles} />
      <SidePanel
        className={isSmallScreen ? 'w-full' : 'flex-shrink-0 flex-grow-0 w-1/3'}
      />
    </div>
  );
};
const LayoutWithSocket = withSocket(Layout);
export { LayoutWithSocket as Layout };
