import { CANCEL } from '@dataTransferTypes/event';
import { Operation } from '@dataTransferTypes/operation';
import EventEmitter from 'events';
import Container from 'typedi';
import { collectionToString, hasIntersection } from './collectionHelper';

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

const withMultiOperationsCancellation = async (
  operations: Set<Operation>,
  action: (cancellationToken: CancellationToken) => Promise<void>
) => {
  console.log(
    `Listening for cancellations for ${collectionToString(operations)}`
  );
  const eventEmitter = Container.get(EventEmitter);
  const cancellationToken = new CancellationToken();
  const cancelHandler = (operationsToCancel: Operation[]) => {
    console.log(
      `[cancellationToken] Got ${collectionToString(
        operationsToCancel
      )} cancellation request from event emitter`
    );
    if (hasIntersection(operations, operationsToCancel)) {
      console.log(
        `Cancelling ${collectionToString(operationsToCancel)} operations...`
      );
      cancellationToken.cancel();
    } else {
      console.log(
        `Skip ${collectionToString(
          operationsToCancel
        )} cancellation request from event emitter. Current operations: ${collectionToString(
          operations
        )}`
      );
    }
  };
  eventEmitter.on(CANCEL, cancelHandler);
  try {
    await action(cancellationToken);
  } catch (e) {
    if (cancellationToken.isCancellationRequested) {
      return Promise.resolve();
    }
    throw e;
  } finally {
    eventEmitter.off(CANCEL, cancelHandler);
    cancellationToken.clearCallbacks();
  }
};

const withCancellation = async (
  operation: Operation,
  action: (cancellationToken: CancellationToken) => Promise<void>
) => withMultiOperationsCancellation(new Set<Operation>([operation]), action);

export { CancellationToken, withCancellation, withMultiOperationsCancellation };
