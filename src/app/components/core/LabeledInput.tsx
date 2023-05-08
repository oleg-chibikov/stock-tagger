import clsx from 'clsx';
import { FunctionComponent } from 'react';
import { Styleable } from '../Styleable';

interface LabeledInputProps extends Styleable {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  labelClassName?: string;
  inputClassName?: string;
}

const LabeledInput: FunctionComponent<LabeledInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  labelClassName,
  className,
  inputClassName,
}) => {
  return (
    <div className={clsx('flex items-center', className)}>
      <label
        htmlFor={label}
        className={clsx('mr-2', { 'w-auto': !labelClassName }, labelClassName)}
      >
        {label}:
      </label>
      <input
        id={label}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={clsx('p-2', inputClassName)}
      />
    </div>
  );
};

export { LabeledInput };
