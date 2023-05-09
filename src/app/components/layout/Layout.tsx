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
    gap-3
    ${isSmallScreen ? 'flex-col' : 'flex-row'}
    items-start
    justify-center
    p-${isSmallScreen ? '4' : '8'}
    bg-gray-900
    h-screen
    overflow-x-hidden
  `;

  const mainSectionStyles = `
    flex-1
    mr-${isSmallScreen ? '0' : '4'}
  `;

  const sidePanelStyles = `
    ${isSmallScreen ? 'w-full' : 'w-2/5'}
    mt-${isSmallScreen ? '4' : '0'}
  `;

  return (
    <Provider store={store}>
      <div className={containerStyles}>
        <MainSection className={mainSectionStyles} />
        <SidePanel className={sidePanelStyles} />
      </div>
    </Provider>
  );
};

export { Layout };
