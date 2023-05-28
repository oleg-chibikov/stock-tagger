import { CANCEL } from '@dataTransferTypes/event';
import { Operation } from '@dataTransferTypes/operation';
import EventEmitter from 'events';
import Container from 'typedi';

type CancellationCallback = (...params: any) => any;

class CancellationToken {
  private isCancelled: boolean = false;
  private cancellationCallbacks: CancellationCallback[] = [];

  public get isCancellationRequested(): boolean {
    return this.isCancelled;
  }

  public addCancellationCallback(callback: CancellationCallback): void {
    this.cancellationCallbacks.push(callback);
  }

  public removeCancellationCallback(callback: CancellationCallback): void {
    const index = this.cancellationCallbacks.indexOf(callback);
    if (index !== -1) {
      this.cancellationCallbacks.splice(index, 1);
    }
  }

  public clearCallbacks(): void {
    this.cancellationCallbacks = [];
  }

  public cancel(): void {
    this.isCancelled = true;
    for (const callback of this.cancellationCallbacks) {
      callback();
    }
  }
}

const withCancellation = async (
  action: (cancellationToken: CancellationToken) => Promise<void>,
  operation: Operation
) => {
  const eventEmitter = Container.get(EventEmitter);
  const cancellationToken = new CancellationToken();
  const cancelHandler = (op: Operation) => {
    if (op === operation) {
      console.log(`Got ${operation} cancellation request from event emitter`);
      cancellationToken.cancel();
    }
  };
  eventEmitter.on(CANCEL, cancelHandler);
  try {
    await action(cancellationToken);
  } finally {
    eventEmitter.off(CANCEL, cancelHandler);
    cancellationToken.clearCallbacks();
  }
};

export { withCancellation, CancellationToken };
