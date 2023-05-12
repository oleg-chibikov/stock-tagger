'use client';
import { store } from '@store/store';
import { FunctionComponent } from 'react';
import { Provider } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import { MainSection } from './MainSection';
import { SidePanel } from './SidePanel';

const Layout: FunctionComponent = () => {
  const isSmallScreen = useMediaQuery({ maxWidth: 767 });

  const containerStyles = `
    flex
    gap-2
    ${isSmallScreen ? 'flex-col' : 'flex-row'}
    items-start
    p-${isSmallScreen ? '4' : '8'}
    bg-gray-900
    h-screen
    overflow-x-hidden
  `;

  return (
    <Provider store={store}>
      <div className={containerStyles}>
        <MainSection />
        <SidePanel
          className={
            isSmallScreen ? undefined : 'flex-shrink-0 flex-grow-0 w-1/3'
          }
        />
      </div>
    </Provider>
  );
};

export { Layout };
