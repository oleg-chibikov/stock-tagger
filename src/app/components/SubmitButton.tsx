import { cancelOperations, uploadCsv } from '@apiClient/backendApiClient';
import { createCSVData } from '@appHelpers/csvHelper';
import { getNotUploadedImages } from '@appHelpers/imageHelper';
import { TagsButtonProps } from '@components/DownloadButton';
import { Loader } from '@components/core/Loader';
import { FunctionComponent, useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { CancelButton } from './core/CancelButton';

const SubmitButton: FunctionComponent<TagsButtonProps> = ({
  images,
  tags,
  title,
  category,
}) => {
  const [isReadyToSubmit, setIsReadyToSubmit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (images.length && !getNotUploadedImages(images).length) {
      setIsReadyToSubmit(true);
    }
  }, [images]);

  const uploadTagsAndSubmitImages = async () => {
    setIsLoading(true);
    try {
      const csvData = createCSVData(images, tags, title, category);
      await uploadCsv(csvData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadTagsAndSubmit = () => {
    if (isReadyToSubmit) {
      uploadTagsAndSubmitImages();
    }
  };

  const handleReadyToSubmit = () => {
    setIsReadyToSubmit(true);
  };

  const getButtonTooltip = () => {
    let buttonTooltip: string | undefined = undefined;
    if (isLoading) {
      buttonTooltip = 'Loading...';
    } else if (category === undefined) {
      buttonTooltip = 'Please select the category';
    } else {
      if (!isReadyToSubmit) {
        buttonTooltip =
          'Please upscale/upload images first or click the button to the right if you have uploaded the images to the stock already';
      }
    }
    return buttonTooltip;
  };

  let buttonTooltip: string | undefined = getButtonTooltip();

  return (
    <div className="flex flex-row gap-2 items-center justify-center">
      <button
        title={buttonTooltip}
        disabled={!category || !isReadyToSubmit || isLoading}
        onClick={handleUploadTagsAndSubmit}
      >
        {'Upload tags and submit images to stock'}
      </button>
      {isLoading && (
        <>
          <Loader />
          <CancelButton onClick={() => cancelOperations(['upload_csv'])} />
        </>
      )}
      {!isLoading && !isReadyToSubmit && (
        <button
          className="icon"
          title="I want to upload tags anyway (the images are already uploaded to stock)"
          onClick={handleReadyToSubmit}
        >
          <FaCheck />
        </button>
      )}
    </div>
  );
};

export { SubmitButton };
