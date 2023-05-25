import { FunctionComponent } from 'react';

interface ImageMarkerProps {
  isActive: boolean;
}
const SelectedImageMarker: FunctionComponent<ImageMarkerProps> = ({
  isActive,
}) => (
  <>
    {isActive && (
      <div className="absolute top-3 right-3 w-6 h-6 flex justify-center items-center bg-white rounded-full border-black border-2">
        <span className="text-black font-bold">✓</span>
      </div>
    )}
  </>
);

const UpscaledImageMarker: FunctionComponent<ImageMarkerProps> = ({
  isActive,
}) => (
  <>
    {isActive && (
      <div className="absolute top-3 left-3 w-6 h-6 flex justify-center items-center bg-white rounded-full border-black border-2">
        <span className="text-black font-bold">U</span>
      </div>
    )}
  </>
);

export { SelectedImageMarker, UpscaledImageMarker };
