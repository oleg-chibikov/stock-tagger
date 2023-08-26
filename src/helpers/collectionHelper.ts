const collectionToString = (collection: Set<any> | any[]): string => {
  return [...collection].join(', ');
};

function hasIntersection<T>(set: Set<T>, array: T[]): boolean {
  for (let item of array) {
    if (set.has(item)) {
      return true;
    }
  }
  return false;
}

export { collectionToString, hasIntersection };
