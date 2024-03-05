import { CancellationToken } from './cancellationToken';

const delay = async (
  milliseconds: number,
  cancellationToken?: CancellationToken
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    try {
      cancellationToken?.addCancellationCallback(reject);
      setTimeout(() => {
        resolve();
      }, milliseconds);
    } finally {
      cancellationToken?.removeCancellationCallback(reject);
    }
  });
};

export { delay };
