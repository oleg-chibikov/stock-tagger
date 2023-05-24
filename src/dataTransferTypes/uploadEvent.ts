import { ImageFileData } from './imageFileData';
import { OperationStatus } from './operationStatus';

interface UploadEvent extends ImageFileData {
  progress: number;
  operationStatus: OperationStatus;
}

export type { UploadEvent };
