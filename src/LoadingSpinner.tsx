/* eslint-disable @typescript-eslint/no-unused-vars */
import { CSSProperties } from 'react';
import ScaleLoader from 'react-spinners/ScaleLoader';
import { useLoading } from './LoadingContext'; // Import useLoading from the context file

const override: CSSProperties = {
  margin: '0 auto',
  display: 'block',
};

export default function LoadingSpinner() {
  const { loadingBoolean, loadingMessage } = useLoading(); // Access loading state from the context

  return (
    <section className="loading-container">
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
      {/* <div className="loading-message">Fetching data...</div> */}
    </section>
  );
}
