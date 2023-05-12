import clsx from 'clsx';
import { FunctionComponent, useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { Styleable } from './Styleable';

interface HelpIconProps extends Styleable {
  iconClassName?: string;
}

const messages = [
  'Select the images which you would like to submit to stock.',
  'Upscale them if needed using the Upscale button and upload to stock using the Upload to FTP button.',
  'Unless you select some of the images (click on the image), all of them will be processed.',
  'Click Retrieve tags and captions to get the metadata about the image',
  '(Imagga for tags, CLIP and PNG chunk info for captions)',
  'or enter the caption and tags manually.',
  'Without the selection, only the first image will be used for tag and caption retrieval.',
  'Either download tags as a file and upload/submit the images manually',
  'or click Upload tags button to do the processing automatically using Puppeteer.',
  'You will need a separate Chrome installation (for example, Chrome Canary)',
  'as Puppeteer cannot work with the currently open instance.',
  'Before processing images, log in to the stock website (one-time operation).',
];

const HelpIcon: FunctionComponent<HelpIconProps> = ({
  iconClassName,
  className,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={clsx('self-center relative inline-block', className)}>
      <FaInfoCircle
        className={clsx(
          'w-10 h-10 cursor-pointer text-teal-500',
          iconClassName
        )}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
      {showTooltip && (
        <div className="min-w-max bg-gray-100 text-sm text-black border p-2 rounded-lg shadow-md absolute top-full left-full transform -translate-x-full text-center">
          {messages.map((message, index) => (
            <div className="flex" key={index}>
              <span className="flex-none mr-1">
                <div className="w-4 h-4 bg-gray-100 transform rotate-45" />
              </span>
              <span className="flex-auto">{message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { HelpIcon };
