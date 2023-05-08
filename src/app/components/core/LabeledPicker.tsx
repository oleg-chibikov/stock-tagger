import clsx from 'clsx';
import { ComboBox, ComboBoxProps, StringOrNumber } from './ComboBox';

interface LabeledPickerProps extends ComboBoxProps {
  label: string;
  onSelect: (value: StringOrNumber) => void;
  labelClassName?: string;
  inputClassName?: string;
}

const LabeledPicker = (props: LabeledPickerProps) => {
  const {
    onSelect,
    label,
    className,
    labelClassName,
    inputClassName,
    ...rest
  } = props;
  return (
    <div className={clsx('relative flex items-center', className)}>
      <label htmlFor={label} className={clsx('mr-2', labelClassName)}>
        {label}:
      </label>
      <ComboBox {...rest} onSelect={onSelect} className={inputClassName} />
    </div>
  );
};

export { LabeledPicker };
