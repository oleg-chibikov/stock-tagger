import clsx from 'clsx';
import { ChangeEvent, FunctionComponent, ReactNode } from 'react';
import { Styleable } from './Styleable';

interface ImagePickerProps extends Styleable {
  onSelect: (images: FileList | null) => void;
  children?: ReactNode;
}

const ImagePicker: FunctionComponent<ImagePickerProps> = ({
  onSelect,
  className,
  children,
}) => {
  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    onSelect(event.target.files);
  };

  return (
    <div className={clsx('flex flex-col items-center space-y-2', className)}>
      <div className="flex gap-2 w-full">
        <label
          htmlFor="image-input"
          className="w-full bg-teal-500 hover:bg-teal-700 p-2 flex justify-center"
        >
          Select Images
        </label>
        {children}
      </div>
      <input
        type="file"
        id="image-input"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
};

export { ImagePicker };
