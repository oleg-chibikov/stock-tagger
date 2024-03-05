import path from 'path';

const outputDirectory = 'public';
const outputPath = path.join(path.resolve(process.cwd()), outputDirectory);
const toWebUrl = (path: string) => path.replace(`${outputPath}\\`, '');

const toServerUrl = (path: string) => `${outputPath}\\${path}`;

export { outputPath, toServerUrl, toWebUrl };
