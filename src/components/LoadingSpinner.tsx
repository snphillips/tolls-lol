import CircularProgress from '@mui/material/CircularProgress';
import './LoadingSpinner.css';

export default function LoadingSpinner() {
  return (
    <>
      <CircularProgress className="loading-spinner" aria-label="Loading Spinner" data-testid="loader" />
    </>
  );
}
