import { FunctionComponent, ReactNode } from 'react';
import { Loader } from './Loader';

interface LoaderOverlayProps {
  isLoading?: boolean;
  children?: ReactNode;
}

const LoaderOverlay: FunctionComponent<LoaderOverlayProps> = ({
  isLoading = true,
  children,
}) => {
  return (
    <div className="relative">
      {isLoading && (
        <div className="z-10 absolute inset-0 flex justify-center items-center">
          <Loader />
        </div>
      )}
      <div style={{ filter: isLoading ? 'grayscale(100%)' : 'none' }}>
        {children}
      </div>
    </div>
  );
};

export { LoaderOverlay };
