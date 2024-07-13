import { CSSProperties } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { useLoading } from './LoadingContext'; // Import useLoading from the context file

const override: CSSProperties = {
  margin: '0 auto',
  position: 'fixed',
  // top: '50%',
  // left: '50%',
};

export default function LoadingSpinner() {
  const { loadingBoolean, loadingMessage } = useLoading(); // Access loading state from the context

  return (
    <div className="sweet-loading">
      <ScaleLoader
        className="loading-spinner"
        color={'#fefefe'}
        loading={loadingBoolean}
        cssOverride={override}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
      <div className="loading-message">{loadingMessage}</div>
    </div>
  );
}
