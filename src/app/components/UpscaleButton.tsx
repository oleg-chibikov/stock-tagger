import { ComboBox } from '@components/core/ComboBox';
import { UpscaleModel } from '@dataTransferTypes/upscaleModel';
import React, { useState } from 'react';

interface UpscaleButtonProps {
  allAreUpscaled: boolean;
  upscaleModel: UpscaleModel;
  onUpscale: () => void;
  onUpscaleModelChange: (value: UpscaleModel) => void;
  onUploadImmediatelyChanged: (value: boolean) => void;
  initialUploadImmediately: boolean;
}

const UpscaleButton: React.FC<UpscaleButtonProps> = ({
  allAreUpscaled,
  upscaleModel,
  onUpscale,
  onUpscaleModelChange,
  onUploadImmediatelyChanged,
  initialUploadImmediately,
}) => {
  const [uploadImmediately, setUploadImmediately] = useState(
    initialUploadImmediately
  );

  const handleUpscale = () => {
    onUpscale();
  };

  const handleUploadImmediatelyChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { checked } = event.target;
    setUploadImmediately(checked);
    onUploadImmediatelyChanged(checked);
  };

  return (
    <div className="w-full flex flex-row gap-2">
      <button
        className={allAreUpscaled ? 'bg-gray-500' : undefined}
        onClick={handleUpscale}
      >
        {allAreUpscaled ? 'Re-' : ''}Upscale
      </button>
      <ComboBox
        className="w-80"
        value={upscaleModel}
        onSelect={(value) => {
          onUpscaleModelChange(value as UpscaleModel);
        }}
        items={[
          { label: 'Real ESRGAN 4x', value: 'RealESRGAN_x4plus' },
          {
            label: 'Real ESRGAN 4x Anime',
            value: 'RealESRGAN_x4plus_anime_6B',
          },
          { label: 'ESRGAN 4x', value: 'ESRGAN_SRx4' },
        ]}
      />
      <label className="flex items-center whitespace-nowrap">
        <input
          type="checkbox"
          checked={uploadImmediately}
          onChange={handleUploadImmediatelyChange}
        />
        <span className="ml-2">Upload Immediately</span>
      </label>
    </div>
  );
};

export { UpscaleButton };
