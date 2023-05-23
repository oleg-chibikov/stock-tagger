type Operation = 'unknown' | 'upscale' | 'ftp_upload' | 'caption';

type OperationStatus =
  | 'unknown'
  | 'upscale'
  | 'upscale_done'
  | 'upscale_error'
  | 'ftp_upload'
  | 'ftp_upload_done'
  | 'ftp_upload_error';

interface ImageFileData {
  fileName: string;
  filePath: string;
}

interface UploadEvent extends ImageFileData {
  progress: number;
  operationStatus: OperationStatus;
}

export type { Operation, OperationStatus, UploadEvent, ImageFileData };
