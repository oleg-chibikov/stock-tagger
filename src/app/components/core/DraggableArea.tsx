import clsx from 'clsx';
import React, { FunctionComponent, useState } from 'react';
import { Styleable } from './Styleable';

interface DraggableAreaProps extends Styleable {
  onDropFiles: (files: FileList) => void;
  children: React.ReactNode;
}

const DraggableArea: FunctionComponent<DraggableAreaProps> = ({
  onDropFiles,
  children,
  className,
}) => {
  const [dragStatus, setDragStatus] = useState(false);

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
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setDragStatus(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragStatus(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onDropFiles(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  };

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={clsx(
        className,
        'transition-colors duration-200 ease-in-out',
        dragStatus
          ? 'bg-teal-300 bg-opacity-30 border-4 border-dashed border-teal-500'
          : 'bg-opacity-10 bg-teal-300'
      )}
    >
      {children}
    </div>
  );
};

export { DraggableArea };
