import { FunctionComponent } from 'react';
import Spinner from 'react-spinners/ScaleLoader';

interface LoaderProps {
  loading?: boolean;
}
const Loader: FunctionComponent<LoaderProps> = ({ loading = true }) => (
  <Spinner
    color="#00BFFF"
    loading={loading}
    aria-label="Loading Spinner"
    data-testid="loader"
  />
);

export { Loader };
