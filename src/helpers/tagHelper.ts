const maxTags = 49;
const maxTagsToRetrieve = maxTags - 5; // max number is 49, but having a smaller number gives some space to add tags manually

interface Tag {
  confidence: number;
  tag: {
    en: string;
  };
}

function getUniqueTags(tags: Tag[][], previousTags: string[]): string[] {
  const flatTags = tags.flatMap((innerArray) => innerArray.map((tag) => tag));
  const sortedTags = flatTags
    .sort((a, b) => b.confidence - a.confidence)
    .map((t) => t.tag.en);
  let uniqueTags: Set<string>;
  if (previousTags.length) {
    uniqueTags = new Set<string>(previousTags);
    sortedTags.forEach((tag) => uniqueTags.add(tag));
  } else {
    uniqueTags = new Set(sortedTags);
  }
  const updatedTags = [...uniqueTags].slice(0, maxTagsToRetrieve); // not more than maxTagsToRetrieve tags

  return updatedTags;
}

export { getUniqueTags, maxTags };
export type { Tag };
