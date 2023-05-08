import path from 'path';
import text from 'png-chunk-text';
import extractChunks from 'png-chunks-extract';
import { Service } from 'typedi';
import {
  capitalize,
  getActivateCondaCommand,
  removeEndingDot,
  runCommands,
} from './helper';

interface CaptioningResult {
  caption: string;
  similarity: number;
}

@Service()
class CaptioningService {
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
      process.cwd()
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
          caption: this.sanitize(string),
          similarity,
        } as CaptioningResult;
      });
  }

  extractTextChunks = (buffer: Buffer): string[] => {
    const chunks = extractChunks(buffer);
    const textChunks = chunks
      .filter((chunk) => chunk.name === 'tEXt')
      .map((chunk) => text.decode(chunk.data))
      .filter((chunk) => chunk.keyword === 'parameters')
      .map((x) => x.text);

    console.log(`${textChunks.length} text chunks`);
    const targetString = 'Negative prompt:';
    const result: string[] = [];

    for (const text of textChunks) {
      const targetIndex = text.indexOf(targetString);
      const extractedText =
        targetIndex !== -1 ? text.slice(0, targetIndex) : text;
      result.push(this.sanitize(extractedText));
    }

    return result;
  };

  private sanitize = (s: string) => removeEndingDot(capitalize(s.trim()));

  private getCaptioningDirectory = (localPath: string) =>
    path.join('src', 'backend', 'captioning', localPath);
}

export type { CaptioningResult };
export { CaptioningService };
