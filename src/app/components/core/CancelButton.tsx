import { FunctionComponent } from 'react';
import { FaTimes } from 'react-icons/fa';

type CancelButtonProps = {
  onClick: () => void;
};

export const CancelButton: FunctionComponent<CancelButtonProps> = ({
  onClick,
}) => {
  return (
    <button className="icon cancel" title="Cancel" onClick={onClick}>
      <FaTimes />
    </button>
  );
};
