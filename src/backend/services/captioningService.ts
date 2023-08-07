import {
  getActivateCondaCommand,
  runCommands,
} from '@backendHelpers/commandHelper';
import { sanitize } from '@backendHelpers/promptHelper';
import EventEmitter from 'events';
import path from 'path';
import text from 'png-chunk-text';
import extractChunks from 'png-chunks-extract';
import { Service } from 'typedi';

interface CaptioningResult {
  caption: string;
  similarity: number;
}

@Service()
class CaptioningService {
  constructor(private eventEmitter: EventEmitter) {}
  async installDependencies(): Promise<void> {
    console.log('Installing captioning service dependencies...');
    await runCommands(
      [getActivateCondaCommand(), 'pip install pycocotools openai-clip'],
      process.cwd()
    );
    console.log('Installed captioning service dependencies');
  }

  async generateCaptions(
    imagePath: string,
    annotationsPath: string,
    batchSize = 32,
    numberOfAnnotations = 600,
    numberOfResults = 10
  ): Promise<CaptioningResult[]> {
    const output = await runCommands(
      [
        getActivateCondaCommand(),
        `python "${this.getCaptioningDirectory(
          'run_search.py'
        )}" "${imagePath}" "${this.getCaptioningDirectory(
          annotationsPath
        )}" --batch_size ${batchSize} --num_samples ${numberOfAnnotations} --num_results ${numberOfResults}`,
      ],
      process.cwd(),
      this.eventEmitter,
      'caption'
    );
    const lines = output.split('\n');
    const startIndex = lines.findIndex((line) =>
      line.includes('index created!')
    );

    if (startIndex === -1) {
      throw new Error('Index creation message not found in the output.');
    }

    return lines
      .slice(startIndex + 1)
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const [string, similarityText] = line.split('(similarity:');
        const similarity = similarityText?.length
          ? parseFloat(similarityText.substring(0, similarityText.length - 2))
          : 0;
        return {
          caption: sanitize(string),
          similarity,
        } as CaptioningResult;
      });
  }

  extractTextChunks = (buffer: Buffer): string[] => {
    const chunks = extractChunks(buffer);
    const textChunks = chunks
      .filter((chunk) => chunk.name === 'tEXt')
      .map((chunk) => text.decode(chunk.data));

    const parametersChunks = textChunks
      .filter((chunk) => chunk.keyword === 'parameters')
      .map((x) => x.text);

    const extractTextG = (jsonString: string): string | undefined => {
      const regex = /"text_g"\s*:\s*"([^"]+)"/g;
      let match;

      if ((match = regex.exec(jsonString)) !== null) {
        return match[1];
      }
    };

    const textGChunks = textChunks
      .filter((x) => x.text.indexOf('"text_g"') !== -1)
      .map((x) => extractTextG(x.text))
      .filter((x) => x)
      .map((x) => x as string);

    const allChunks = parametersChunks.concat(textGChunks);

    console.log(`${allChunks.length} text chunks`);

    return allChunks.map(sanitize);
  };

  private getCaptioningDirectory = (localPath: string) =>
    path.join('src', 'backend', 'captioning', localPath);
}

export { CaptioningService };
export type { CaptioningResult };
