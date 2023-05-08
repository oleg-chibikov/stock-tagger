type UploadOperation = 'unknown' | 'upscale' | 'ftp_upload';

interface UploadEvent {
  fileName: string;
  progress: number;
  operation: UploadOperation;
}

export type { UploadOperation, UploadEvent };
