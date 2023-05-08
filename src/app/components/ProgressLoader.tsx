import { UploadOperation } from '@dataTransferTypes/upload';
import clsx from 'clsx';
import { FunctionComponent } from 'react';

interface ProgressLoadersProps {
  uploadProgress: Record<string, ProgressState>;
}

export interface ProgressState {
  progress: number;
  operation: UploadOperation;
}

const operationToString = (operation: UploadOperation) => {
  switch (operation) {
    case 'upscale':
      return 'Upscale';
    case 'ftp_upload':
      return 'FTP Upload';
    default:
      return 'Initialising';
  }
};

const ProgressLoader: FunctionComponent<ProgressLoadersProps> = ({
  uploadProgress,
}) => {
  return (
    <>
      {Object.keys(uploadProgress).map((imageName) => {
        const { progress, operation } = uploadProgress[imageName];
        return (
          <div key={imageName} className="my-4">
            <div>{imageName}</div>
            <div className="flex flex-row items-center my-2">
              <div className="bg-gray-200 h-3 w-full rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'bg-teal-500 h-full transition-all ease-out duration-500',
                    { 'w-full': progress === 1 }
                  )}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="ml-2">{operationToString(operation)}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export { ProgressLoader };
