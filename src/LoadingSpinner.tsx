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
  const { loading } = useLoading(); // Access loading state from the context

  console.log('loading:', loading);

  return (
    <div className="sweet-loading">
      <ScaleLoader
        color={'#fefefe'}
        loading={loading}
        cssOverride={override}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
}
