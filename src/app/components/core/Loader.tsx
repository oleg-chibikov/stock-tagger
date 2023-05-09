import { FunctionComponent } from 'react';
import Spinner from 'react-spinners/ScaleLoader';

interface LoaderProps {
  isLoading?: boolean;
}
const Loader: FunctionComponent<LoaderProps> = ({ isLoading = true }) => (
  <Spinner
    color="#00BFFF"
    loading={isLoading}
    aria-label="Loading Spinner"
    data-testid="loader"
  />
);

export { Loader };
