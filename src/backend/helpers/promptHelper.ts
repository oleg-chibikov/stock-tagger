const promptPrefixes = new Set<string>(['elden ring', 'Dreamlikeart']);
const promptPostfixes = new Set<string>(['Negative prompt:', 'Steps:']);

const capitalize = (s?: string) => (s && s[0].toUpperCase() + s.slice(1)) || '';

const removeEndingDot = (str: string): string => {
  return str.endsWith('.') ? str.slice(0, -1) : str;
};

const trimStart = (text: string, targetString: string): string => {
  const targetIndex = text.indexOf(targetString);
  return targetIndex !== -1
    ? text.slice(targetIndex + targetString.length)
    : text;
};

const trimEnd = (text: string, targetString: string): string => {
  const targetIndex = text.indexOf(targetString);
  return targetIndex !== -1 ? text.slice(0, targetIndex) : text;
};

const removePrefixesAndPostfixes = (text: string): string => {
  let result = text;

  for (const prefix of promptPrefixes) {
    result = trimStart(result, prefix);
  }

  for (const postfix of promptPostfixes) {
    result = trimEnd(result, postfix);
  }

  return result;
};

const sanitize = (text: string) =>
  removeEndingDot(capitalize(removePrefixesAndPostfixes(text)));

export { sanitize };
