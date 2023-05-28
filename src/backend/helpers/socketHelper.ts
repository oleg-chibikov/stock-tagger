import { PROGRESS } from '@dataTransferTypes/event';
import { OperationStatus } from '@dataTransferTypes/operationStatus';
import { UploadEvent } from '@dataTransferTypes/uploadEvent';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

const emitEvent = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
  fileName: string,
  progress: number,
  operationStatus: OperationStatus,
  filePath?: string
) => {
  io.emit(PROGRESS, {
    fileName,
    filePath,
    progress,
    operationStatus,
  } as UploadEvent);
};

export { emitEvent };
