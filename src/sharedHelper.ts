const delay = async (milliseconds: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
};

type CancellationCallback = () => void;

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

  public cancel(): void {
    this.isCancelled = true;
    for (const callback of this.cancellationCallbacks) {
      callback();
    }
  }
}

export { CancellationToken, delay };
