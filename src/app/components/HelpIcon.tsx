import clsx from 'clsx';
import { FunctionComponent, useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { Styleable } from './Styleable';

interface HelpIconProps extends Styleable {
  iconClassName?: string;
}

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
        <div
          className={
            'min-w-max bg-gray-100 text-sm text-black border p-2 rounded-lg shadow-md absolute top-full left-full transform -translate-x-full text-center'
          }
        >
          Select the images for which you would like to get the tags.
          <br />
          Tags will be downloaded as a CSV file and you will need to upload them
          to Adobe stock manually.
          <br />
          Tags will be applied to all the images regardless of the selection and
          will be submitted to the stock.
          <br />
          Without the selection only the first image will be used for tag
          retrieval.
          <div
            className="absolute top-0 right-1 w-4 h-4"
            style={{
              transform: 'translate(-50%, -50%) rotate(45deg)',
              background: 'inherit',
            }}
          />
        </div>
      )}
    </div>
  );
};

export { HelpIcon };
