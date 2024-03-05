import { downloadCSV } from '@appHelpers/csvHelper';
import { ImageWithData } from '@appHelpers/imageHelper';
import { FunctionComponent } from 'react';

interface TagsButtonProps {
  images: ImageWithData[];
  tags: string[];
  title: string;
  category?: number;
}

const DownloadTagsButton: FunctionComponent<TagsButtonProps> = ({
  images,
  tags,
  title,
  category,
}) => {
  const handleDownloadTags = async () => {
    await downloadCSV(images, tags, title, category);
    window
      ?.open('https://contributor.stock.adobe.com/en/uploads', '_blank')
      ?.focus();
  };

  return <button onClick={handleDownloadTags}>Download tags</button>;
};

export { DownloadTagsButton };
export type { TagsButtonProps };
