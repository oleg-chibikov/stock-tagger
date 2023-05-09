type UploadOperation =
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
  operation: UploadOperation;
}

export type { UploadOperation, UploadEvent, ImageFileData };
