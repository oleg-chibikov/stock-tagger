import clsx from 'clsx';
import { FunctionComponent, useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { Styleable } from './Styleable';

interface HelpIconProps extends Styleable {
  iconClassName?: string;
  messages: string[];
}

const HelpIcon: FunctionComponent<HelpIconProps> = ({
  iconClassName,
  className,
  messages,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={className}>
      <div className="relative">
        <FaInfoCircle
          className={clsx(
            'w-10 h-10 cursor-pointer text-teal-500',
            iconClassName
          )}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
        {showTooltip && (
          <>
            <div className="min-w-max bg-gray-100 text-sm text-black border p-2 rounded-lg shadow-md absolute top-full left-full transform -translate-x-full text-center">
              {messages.map((message, index) => (
                <div className="flex" key={index}>
                  <span className="flex-auto">{message}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { HelpIcon };
