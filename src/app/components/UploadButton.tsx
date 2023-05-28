import { FunctionComponent } from 'react';

interface UploadToStockButtonProps {
  allAreUploaded: boolean;
  handleUploadToStock: () => void;
}

const UploadToStockButton: FunctionComponent<UploadToStockButtonProps> = ({
  allAreUploaded,
  handleUploadToStock,
}) => {
  return (
    <button
      className={allAreUploaded ? 'bg-gray-500' : undefined}
      onClick={handleUploadToStock}
    >
      {allAreUploaded ? 'Re-' : ''}Upload to stock
    </button>
  );
};

export { UploadToStockButton };
