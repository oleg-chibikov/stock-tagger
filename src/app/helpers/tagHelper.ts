const generativeAiTags = ['Generative AI', 'Generative', 'AI'];
const maxTags = 49;

interface Tag {
  confidence: number;
  tag: {
    en: string;
  };
}

function getUniqueTags(
  tags: Tag[][],
  previousTags: string[],
  isAi: boolean
): string[] {
  const flatTags = tags.flatMap((innerArray) => innerArray.map((tag) => tag));
  const sortedTags = flatTags
    .sort((a, b) => b.confidence - a.confidence)
    .map((t) => t.tag.en);
  let uniqueTags: Set<string>;
  if (previousTags.length) {
    uniqueTags = new Set<string>(previousTags);
    generativeAiTags.forEach((tag) => uniqueTags.delete(tag));
    sortedTags.forEach((tag) => uniqueTags.add(tag));
  } else {
    uniqueTags = new Set(sortedTags);
  }
  const updatedTags = [...uniqueTags].slice(
    0,
    isAi ? maxTags - generativeAiTags.length : maxTags
  ); // not more than maxTags tags

  return isAi ? updatedTags.concat(generativeAiTags) : updatedTags;
}

export type { Tag };
export { maxTags, getUniqueTags };
