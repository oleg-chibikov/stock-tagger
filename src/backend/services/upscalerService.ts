import {
  getActivateCondaCommand,
  runCommands,
} from '@backendHelpers/commandHelper';
import { UpscaleModel } from '@dataTransferTypes/upscaleModel';
import * as path from 'path';
import { EventEmitter } from 'stream';
import { Service } from 'typedi';

@Service()
class UpscalerService {
  constructor(private eventEmitter: EventEmitter) {}
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

  async upscale(
    modelName: UpscaleModel,
    inputFilePath: string,
    outputDirectory: string,
    fileName: string
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
      this.eventEmitter,
      'upscale'
    );
    console.log(`Finished upscaling ${fileName}`);
    const parsed = path.parse(fileName);
    const newFilename = `${parsed.name}_out${parsed.ext}`;
    const outputFilePath = path.join(outputDirectory, newFilename);
    return outputFilePath;
  }
}

export { UpscalerService };
