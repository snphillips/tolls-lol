/* eslint-disable @typescript-eslint/no-unused-vars */
import { CSSProperties } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { useLoading } from '../context/LoadingContext';

const override: CSSProperties = {
  margin: '0 auto',
  display: 'block',
};

export default function LoadingSpinner() {
  // Access loading state from the context
  const { loadingBoolean, loadingMessage } = useLoading();

  return (
    <div className="loading-container">
      <ScaleLoader
        className="loading-spinner"
        color={'#fefefe'}
        loading={loadingBoolean}
        // loading={true}
        cssOverride={override}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
      <div className="loading-message">{loadingMessage}</div>
    </div>
  );
}
