const promptPrefixes = new Set<string>(['elden ring', 'Dreamlikeart']);
const promptPostfixes = new Set<string>(['Negative prompt:', 'Steps:']);

const capitalize = (s?: string) => (s && s[0].toUpperCase() + s.slice(1)) || '';

const removeEndingDot = (str: string): string => {
  return str.endsWith('.') ? str.slice(0, -1) : str;
};

const trimTextBefore = (text: string, searchString: string): string => {
  const lowerText = text.toLowerCase();
  const lowerSearchString = searchString.toLowerCase();

  const index = lowerText.indexOf(lowerSearchString);
  if (index !== -1) {
    return text.substring(index + searchString.length);
  }
  return text;
};

const trimTextAfter = (text: string, searchString: string): string => {
  const lowerText = text.toLowerCase();
  const lowerSearchString = searchString.toLowerCase();

  const targetIndex = lowerText.indexOf(lowerSearchString);
  return targetIndex !== -1 ? text.slice(0, targetIndex) : text;
};

const removePrefixesAndPostfixes = (text: string): string => {
  let result = text;

  for (const prefix of promptPrefixes) {
    result = trimTextBefore(result, prefix);
  }

  for (const postfix of promptPostfixes) {
    result = trimTextAfter(result, postfix);
  }

  return result.trim();
};

const sanitize = (text: string) =>
  removeEndingDot(capitalize(removePrefixesAndPostfixes(text)));

export { sanitize };
