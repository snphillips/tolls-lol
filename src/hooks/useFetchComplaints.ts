import { useState, useEffect } from 'react';
import { ComplaintType } from '../types';
import { useLoading } from '../context/LoadingContext';

const dataURL = 'https://tolls-lol.s3.amazonaws.com/obscured-license-plate-complaints.json'; // S3 bucket URL

const useFetchComplaints = () => {
  const { setLoading } = useLoading();
  const [allComplaints, setAllComplaints] = useState<ComplaintType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    // console.log('Fetching data from S3 bucket...');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(dataURL);

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error('Data is not an array');
      }
      setAllComplaints(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        console.error(`Error during fetch: ${error.message}`);
      } else {
        setError('An unknown error occurred');
        console.error('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { allComplaints, error };
};

export default useFetchComplaints;
