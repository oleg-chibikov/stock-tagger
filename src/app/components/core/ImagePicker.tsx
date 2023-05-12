import clsx from 'clsx';
import { ChangeEvent, FunctionComponent, ReactNode, useState } from 'react';
import { ImageWithData, getImageData } from '../../helpers/imageHelper';
import { Styleable } from './Styleable';

interface ImagePickerProps extends Styleable {
  onSelect: (images: ImageWithData[] | null) => void;
  children?: ReactNode;
}

const ImagePicker: FunctionComponent<ImagePickerProps> = ({
  onSelect,
  className,
  children,
}) => {
  const [dragStatus, setDragStatus] = useState(false);

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    processFiles(event.target.files);
  };

  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragIn = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragStatus(true);
  };

  const handleDragOut = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // Ignore the event if the relatedTarget is a descendant of the drag and drop area
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setDragStatus(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragStatus(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      processFiles(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  };

  const processFiles = async (files: FileList | null) => {
    if (files && files.length > 0) {
      const selectedImageData = await Promise.all(
        Array.from(files).map(getImageData)
      );
      onSelect(selectedImageData);
    } else {
      onSelect(null);
    }
  };

  return (
    <div
      className={clsx(
        'flex flex-col items-center space-y-2 select-none',
        className
      )}
    >
      <div className="flex gap-2 w-full">
        <label
          htmlFor="image-input"
          className="w-full bg-teal-500 hover:bg-teal-700 p-2 flex justify-center"
        >
          Select Images
        </label>
        {children}
      </div>
      <h3>or</h3>
      <input
        type="file"
        id="image-input"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={clsx(
          'w-full flex justify-center items-center p-2 h-32 border-dashed border-4 border-teal-500 transition-colors duration-200 ease-in-out rounded-lg',
          dragStatus
            ? ' bg-teal-300 bg-opacity-30'
            : 'bg-opacity-10 bg-teal-300'
        )}
      >
        <p className="text-lg text-white font-bold">Drop your files here</p>
      </div>
    </div>
  );
};

export { ImagePicker };
