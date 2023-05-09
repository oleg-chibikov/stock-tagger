import clsx from 'clsx';
import { ChangeEvent, FunctionComponent } from 'react';
import { ImageWithData, getImageData } from '../../helpers/fileHelper';
import { Styleable } from '../Styleable';

interface ImagePickerProps extends Styleable {
  onSelect: (images: ImageWithData[] | null) => void;
}

const ImagePicker: FunctionComponent<ImagePickerProps> = ({
  onSelect,
  className,
}) => {
  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
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
    <div className={clsx('flex flex-col items-center space-y-2', className)}>
      <label
        htmlFor="image-input"
        className="bg-teal-500 hover:bg-teal-700 py-2 px-2"
      >
        Select Images
      </label>
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
