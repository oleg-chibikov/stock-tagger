import { CancellationToken } from '@appHelpers/cancellationToken';
import {
  getActivateCondaCommand,
  runCommands,
} from '@backendHelpers/commandHelper';
import { deleteFile } from '@backendHelpers/fsHelper';
import { emitEvent } from '@backendHelpers/socketHelper';
import { outputPath, toWebUrl } from '@backendHelpers/uploadHelper';
import { ImageFileData } from '@dataTransferTypes/imageFileData';
import { UpscaleModel } from '@dataTransferTypes/upscaleModel';
import * as path from 'path';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Service } from 'typedi';

@Service()
class UpscalerService {
  constructor() {}
  async installDependencies(): Promise<void> {
    console.log('Installing upscaler service dependencies...');
    await runCommands(
      [
        getActivateCondaCommand(),
        'pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118',
        'pip install basicsr',
        'pip install facexlib',
        'pip install gfpgan',
        'pip install -r requirements.txt',
        'python setup.py develop',
      ],
      process.env.ESRGAN_PATH as string
    );
    console.log('Installed upscaler service dependencies');
  }

  async upscaleWithEvents(
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    image: ImageFileData,
    newFileName: string,
    modelName: UpscaleModel,
    cancellationToken: CancellationToken,
    initialProgress: number = 0,
    finalProgress: number = 1
  ): Promise<string | null> {
    try {
      emitEvent(io, image.fileName as string, initialProgress, 'upscale');
      const outputFilePath = await this.upscale(
        modelName,
        image.filePath,
        outputPath,
        newFileName,
        cancellationToken
      );
      emitEvent(
        io,
        image.fileName,
        finalProgress,
        'upscale_done',
        toWebUrl(outputFilePath)
      );
      return outputFilePath;
    } catch (err: unknown) {
      emitEvent(io, image.fileName, finalProgress, 'upscale_error');
      return null;
    } finally {
      deleteFile(image.filePath);
    }
  }

  private async upscale(
    modelName: UpscaleModel,
    inputFilePath: string,
    outputDirectory: string,
    fileName: string,
    cancellationToken: CancellationToken
  ): Promise<string> {
    console.log(
      `Upscaling ${fileName} (${inputFilePath}) and saving it as ${outputDirectory}...`
    );

    const modelArgument =
      modelName === 'ESRGAN_SRx4'
        ? `--model_path "${path.join('weights', `${modelName}.pth`)}"`
        : `-n ${modelName}`;

    await runCommands(
      [
        getActivateCondaCommand(),
        `python "${path.join(
          process.env.ESRGAN_PATH as string,
          'inference_realesrgan.py'
        )}" --input "${inputFilePath}" --output "${outputDirectory}" ${modelArgument} --tile 256`,
      ],
      process.env.ESRGAN_PATH,
      cancellationToken
    );
    console.log(`Finished upscaling ${fileName}`);
    const parsed = path.parse(fileName);
    const newFilename = `${parsed.name}_out${parsed.ext}`;
    const outputFilePath = path.join(outputDirectory, newFilename);
    return outputFilePath;
  }
}

export { UpscalerService };
