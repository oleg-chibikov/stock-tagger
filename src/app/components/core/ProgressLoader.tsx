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
      return 'Upscaling';
    case 'upscale_done':
      return 'Upscale Finished';
    case 'upscale_error':
      return 'Upscale Error';
    case 'ftp_upload':
      return 'Uploading to FTP';
    case 'ftp_upload_done':
      return 'FTP Upload Finished';
    case 'ftp_upload_error':
      return 'FTP Upload Error';
    default:
      return 'Initialising';
  }
};

const ProgressLoader: FunctionComponent<ProgressLoadersProps> = ({
  uploadProgress,
}) => {
  return (
    <div className="w-full mt-8 pr-2 overflow-auto max-h-80">
      {Object.keys(uploadProgress).map((imageName) => {
        const { progress, operation } = uploadProgress[imageName];
        return (
          <div key={imageName} className="my-2 w-full">
            <div className="flex flex-row items-center my-2">
              <div className="w-48 overflow-auto">{imageName}</div>
              <div className="bg-gray-200 h-3 mx-5 w-full rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'bg-teal-500 h-full transition-all ease-out duration-500',
                    { 'w-full': progress === 1 }
                  )}
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="flex whitespace-nowrap justify-end">
                {operationToString(operation)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { ProgressLoader };
