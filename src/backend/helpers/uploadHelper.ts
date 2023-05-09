const outputDirectory = 'public';

const toWebUrl = (path: string) =>
  '/' + path.replace(`${outputDirectory}\\`, '');

const toServerUrl = (path: string) =>
  `${outputDirectory}\\${path.substring(1)}`;

export { toWebUrl, toServerUrl, outputDirectory };
