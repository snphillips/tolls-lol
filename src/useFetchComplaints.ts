// import { useState, useEffect, useCallback } from 'react';
// import { ComplaintType } from './types';
// import { useLoading } from './LoadingContext';

// const dataURL = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json';

// const useFetchComplaints = () => {
//   const { setLoading } = useLoading();
//   const [allComplaints, setAllComplaints] = useState<ComplaintType[]>([]);
//   const [error, setError] = useState<string | null>(null);

//   const fetchData = useCallback(async () => {
//     console.log('Fetching data from API...');
//     setLoading(true, 'Fetching data...');
//     setError(null);
//     let allData: ComplaintType[] = [];
//     let offset = 0;
//     const limit = 1000;
//     let totalFetched;

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
//         console.log(`Fetching data. OFFSET ${offset}`);
//         const response = await fetch(url);

//         if (!response.ok) {
//           throw new Error(`Error fetching data: ${response.statusText}`);
//         }

//         const data = await response.json();

//         if (!Array.isArray(data)) {
//           throw new Error('Data is not an array');
//         }

//         console.log(`Fetched ${data.length} records from API`);
//         allData = [...allData, ...data];
//         totalFetched = data.length;
//         offset += totalFetched;
//       } while (totalFetched === limit);

//       const dataWithLatLong = allData.filter((item: ComplaintType) => item.latitude && item.longitude);

//       setAllComplaints(dataWithLatLong);
//       localStorage.setItem('complaints', JSON.stringify(dataWithLatLong));
//       localStorage.setItem('lastFetch', new Date().toISOString());
//       console.log('Data fetching complete. Data saved to local storage.');
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         setError(error.message);
//         console.error(`Error during fetch: ${error.message}`);
//       } else {
//         setError('An unknown error occurred');
//         console.error('An unknown error occurred');
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     const lastFetch = localStorage.getItem('lastFetch');
//     const now = new Date().toISOString();

//     // if (!lastFetch || new Date(now).getTime() - new Date(lastFetch).getTime() > 12 * 60 * 60 * 1000) {
//     if (!lastFetch || new Date(now).getTime() - new Date(lastFetch).getTime() > 0.00000012 * 60 * 60 * 1000) {
//       console.log('Data is stale or not present. Fetching new data.');
//       fetchData();
//     } else {
//       const cachedData = localStorage.getItem('complaints');
//       if (cachedData) {
//         const parsedData = JSON.parse(cachedData);
//         setAllComplaints(parsedData);
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

import { useState, useEffect, useCallback } from 'react';
import { ComplaintType } from './types';
import { useLoading } from './LoadingContext';

const dataURL = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json';

const useFetchComplaints = () => {
  const { setLoading } = useLoading();
  const [allComplaints, setAllComplaints] = useState<ComplaintType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false); // Flag to track data loading

  const fetchData = useCallback(async () => {
    console.log('Fetching data from API...');
    setLoading(true, 'Fetching data...');
    setError(null);
    let allData: ComplaintType[] = [];
    let offset = 0;
    const limit = 1000;
    let totalFetched = 0;

    try {
      setLoadingData(true); // Set flag to indicate data is being fetched

      do {
        const query = `
          SELECT
            unique_key, created_date, closed_date,
            incident_address, status, resolution_description,
            latitude, longitude
          WHERE
            caseless_one_of(complaint_type, 'Illegal Parking') AND
            caseless_one_of(descriptor, 'License Plate Obscured') AND
            created_date > '2024-01-01T00:00:00' :: floating_timestamp
          ORDER BY created_date DESC NULL FIRST
          LIMIT ${limit} OFFSET ${offset}
        `;
        const encodedQuery = encodeURIComponent(query);
        const url = `${dataURL}?$query=${encodedQuery}`;
        console.log(`Fetching data from URL: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Data is not an array');
        }

        console.log(`Fetched ${data.length} records from API, OFFSET ${offset}`);
        allData = [...allData, ...data];
        totalFetched = data.length;
        offset += totalFetched;
      } while (totalFetched === limit);

      const dataWithLatLong = allData.filter((item: ComplaintType) => item.latitude && item.longitude);

      setAllComplaints(dataWithLatLong);
      localStorage.setItem('complaints', JSON.stringify(dataWithLatLong));
      localStorage.setItem('lastFetch', new Date().toISOString());
      console.log('Data fetching complete. Data saved to local storage.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        console.error(`Error during fetch: ${error.message}`);
      } else {
        setError('An unknown error occurred');
        console.error('An unknown error occurred');
      }
    } finally {
      setLoading(false, '');
      setLoadingData(false); // Reset flag after data fetching completes
    }
  }, []);

  useEffect(() => {
    const lastFetch = localStorage.getItem('lastFetch');
    const now = new Date().toISOString();

    // Comment out or adjust this condition for development
    // if (!lastFetch || new Date(now).getTime() - new Date(lastFetch).getTime() > 12 * 60 * 60 * 1000) {
    if (!lastFetch || new Date(now).getTime() - new Date(lastFetch).getTime() > 0.00000012 * 60 * 60 * 1000) {
      console.log('Data is stale or not present. Fetching new data.');
      fetchData();
    } else {
      const cachedData = localStorage.getItem('complaints');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setAllComplaints(parsedData);
        console.log('Loaded data from local storage.');
      } else {
        console.log('No cached data found. Fetching new data.');
        fetchData();
      }
    }
  }, [fetchData]); // Only depend on fetchData

  return { allComplaints, error, loadingData }; // Return loadingData flag
};

export default useFetchComplaints;
