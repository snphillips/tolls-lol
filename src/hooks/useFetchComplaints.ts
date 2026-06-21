import { useState, useEffect, useCallback } from 'react';
import { ComplaintType } from '../types';
import { useLoading } from '../context/LoadingContext';

// The URL of the JSON data file stored in an Amazon S3 bucket
const dataURL = 'https://tolls-lol.s3.amazonaws.com/obscured-license-plate-complaints.json';

const useFetchComplaints = () => {
  const { setLoading } = useLoading();

  // Holds the full list of complaints once fetched
  const [allComplaints, setAllComplaints] = useState<ComplaintType[]>([]);

  // Holds an error message if something goes wrong, otherwise null
  const [error, setError] = useState<string | null>(null);

  // useCallback prevents fetchData from being re-created on every render.
  // Without it, the useEffect below would see a "new" fetchData function each
  // render and run in an infinite loop. setLoading is listed as a dependency
  // because fetchData uses it.
  const fetchData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);

      try {
        // Pass the AbortSignal into fetch so the request can be cancelled
        // if the component unmounts before the response arrives
        const response = await fetch(dataURL, { signal });

        // response.ok is false for any HTTP error status (4xx, 5xx).
        // Fetch itself won't throw for these — we have to check manually.
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Sanity-check that the API returned an array, not some unexpected shape
        if (!Array.isArray(data)) {
          throw new Error('Unexpected data format: expected an array of complaints');
        }

        setAllComplaints(data);
      } catch (error: unknown) {
        if (error instanceof Error) {
          // AbortError is thrown when the fetch is intentionally cancelled (see
          // the useEffect cleanup below). It's not a real error, so we bail out
          // silently rather than showing an error message to the user.
          if (error.name === 'AbortError') return;

          setError(error.message);
          console.error(`Error during fetch: ${error.message}`);
        } else {
          setError('An unknown error occurred');
          console.error('An unknown error occurred');
        }
      } finally {
        // Always turn off the loading spinner, whether the fetch succeeded or failed
        setLoading(false);
      }
    },
    [setLoading]
  );

  useEffect(() => {
    // AbortController lets us cancel the in-flight fetch if the component
    // unmounts (e.g. the user navigates away before the data arrives).
    // Without this, the fetch would still complete and try to update state
    // on an unmounted component, which causes a React warning.
    const controller = new AbortController();

    fetchData(controller.signal);

    // This cleanup function runs when the component unmounts
    return () => controller.abort();
  }, [fetchData]);

  // A stable function that callers can use to manually re-trigger the fetch,
  // for example after an error. It doesn't pass a signal because it isn't
  // tied to the component's mount/unmount lifecycle the way the useEffect is.
  const refetch = useCallback(() => fetchData(), [fetchData]);

  return { allComplaints, error, refetch };
};

export default useFetchComplaints;
