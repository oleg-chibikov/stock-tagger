function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  let lastCall: number = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let context: any;
  let args: any[];

  return function (this: any, ...innerArgs: any[]) {
    const now = Date.now();
    const nextCall = lastCall + delay;

    context = this;
    args = innerArgs;

    const later = () => {
      lastCall = Date.now();
      timeoutId = null;
      func.apply(context, args);
    };

    if (now > nextCall) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      later();
    } else if (!timeoutId) {
      timeoutId = setTimeout(later, nextCall - now);
    }
  } as T;
}

export { throttle };
