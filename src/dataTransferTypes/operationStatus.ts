type OperationStatus =
  | 'unknown'
  | 'upscale'
  | 'upscale_done'
  | 'upscale_error'
  | 'ftp_upload'
  | 'ftp_upload_done'
  | 'ftp_upload_error';

export type { OperationStatus };
