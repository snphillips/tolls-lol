import { useState, useEffect } from 'react';
import { ComplaintType } from '../types';
import { useLoading } from '../context/LoadingContext';

const dataURL = 'https://tolls-lol.s3.amazonaws.com/obscured-license-plate-complaints.json'; // S3 bucket URL

const useFetchComplaints = () => {
  const { setLoading } = useLoading();
  const [allComplaints, setAllComplaints] = useState<ComplaintType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    console.log('Fetching data from S3 bucket...');
    setLoading(true, 'Fetching data...');
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
      console.log('data[13]', data[13]);
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

  // useEffect with empty dependency array to ensure fetch happens only once on mount
  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  return { allComplaints, error };
};

export default useFetchComplaints;

// /* eslint-disable @typescript-eslint/no-unused-vars */
// import { useState, useEffect, useCallback } from 'react';
// import { ComplaintType } from '../types';
// import { useLoading } from '../context/LoadingContext';
// import { calcTimeToResolveComplaintInMilliSeconds } from '../utils/calcTimeToResolveComplaintInMilliSeconds';

// const dataURL = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json';

// const useFetchComplaints = () => {
//   const { setLoading } = useLoading();
//   const [allComplaints, setAllComplaints] = useState<ComplaintType[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const processComplaints = (complaints: ComplaintType[]) => {
//     const dataWithLatLong = complaints.filter((item: ComplaintType) => item.latitude && item.longitude);
//     // Calculate time difference between open & closed for every complaint
//     const dataWithTimeDifference = dataWithLatLong.map((complaint) => ({
//       ...complaint,
//       timeDiffInMilliseconds: calcTimeToResolveComplaintInMilliSeconds(complaint),
//     }));
//     return dataWithTimeDifference;
//   };

//   const fetchData = useCallback(async () => {
//     console.log('Fetching data from API...');
//     setLoading(true, 'Fetching data...');
//     setError(null);
//     let allData: ComplaintType[] = [];
//     let offset = 0;
//     const limit = 1000;
//     let totalFetched = 0;

//     try {
//       do {
//         const query = `
//           SELECT
//             unique_key, created_date, closed_date,
//             incident_address, status, resolution_description,
//             latitude, longitude
//           WHERE
//             caseless_one_of(complaint_type, 'Illegal Parking') AND
//             caseless_one_of(descriptor, 'License Plate Obscured') AND
//             created_date > '2024-01-01T00:00:00' :: floating_timestamp
//           ORDER BY created_date DESC NULL FIRST
//           LIMIT ${limit} OFFSET ${offset}
//         `;
//         const encodedQuery = encodeURIComponent(query);
//         const url = `${dataURL}?$query=${encodedQuery}`;
//         const response = await fetch(url);

//         if (!response.ok) {
//           throw new Error(`Error fetching data: ${response.statusText}`);
//         }

//         const data = await response.json();

//         if (!Array.isArray(data)) {
//           throw new Error('Data is not an array');
//         }

//         console.log(`Fetched ${data.length} records from NYC data, OFFSET ${offset}`);
//         allData = [...allData, ...data];
//         totalFetched = data.length;
//         offset += totalFetched;
//       } while (totalFetched === limit);

//       const processedData = processComplaints(allData);
//       setAllComplaints(processedData);
//       localStorage.setItem('complaints', JSON.stringify(allData));
//       localStorage.setItem('lastFetch', new Date().toISOString());
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         setError(error.message);
//         console.error(`Error during fetch: ${error.message}`);
//       } else {
//         setError('An unknown error occurred');
//         console.error('An unknown error occurred');
//       }
//     } finally {
//       // stop loading spinner & no loading message
//       setLoading(false, '');
//     }
//   }, [setLoading]);

//   useEffect(() => {
//     const lastFetch = localStorage.getItem('lastFetch');
//     const now = new Date().toISOString();

//     // Comment out or adjust this condition for development
//     if (!lastFetch || new Date(now).getTime() - new Date(lastFetch).getTime() > 12 * 60 * 60 * 1000) {
//       // if (!lastFetch || new Date(now).getTime() - new Date(lastFetch).getTime() > 0.00000012 * 60 * 60 * 1000) {
//       console.log('Data is stale or not present. Fetching new data.');
//       fetchData();
//     } else {
//       const cachedData = localStorage.getItem('complaints');
//       if (cachedData) {
//         const parsedData = JSON.parse(cachedData);
//         const processedData = processComplaints(parsedData);
//         setAllComplaints(processedData);
//         console.log('Loaded data from local storage.');
//       } else {
//         console.log('No cached data found. Fetching new data.');
//         fetchData();
//       }
//     }
//   }, [fetchData]);

//   return { allComplaints, error };
// };

// export default useFetchComplaints;
