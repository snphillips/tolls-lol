/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { ComplaintType } from '../types';
import { useLoading } from '../context/LoadingContext';
import { calcTimeToResolveComplaintInMilliSecs } from '../utils/calcTimeToResolveComplaintInMilliSecs';

const dataURL = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json';

const useFetchComplaints = () => {
  const { setLoading } = useLoading();
  const [allComplaints, setAllComplaints] = useState<ComplaintType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    console.log('Fetching data from API...');
    setLoading(true, 'Fetching data...');
    setError(null);
    let allData: ComplaintType[] = [];
    let offset = 0;
    const limit = 1000;
    let totalFetched = 0;

    try {
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
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Data is not an array');
        }

        console.log(`Fetched ${data.length} records from NYC data, OFFSET ${offset}`);
        allData = [...allData, ...data];
        totalFetched = data.length;
        offset += totalFetched;
      } while (totalFetched === limit);

      const dataWithLatLong = allData.filter((item: ComplaintType) => item.latitude && item.longitude);

      // Calculate time difference for each complaint
      const dataWithTimeDifference = dataWithLatLong.map((complaint) => ({
        ...complaint,
        timeDiffInMilliSecs: calcTimeToResolveComplaintInMilliSecs(complaint),
      }));

      // Determine the min and max time difference
      // const timeDifferences = dataWithTimeDifference
      //   .map((complaint) => complaint.timeDiffInMilliSecs)
      //   .filter((time) => time !== null) as number[];
      // const minTime = Math.min(...timeDifferences);
      // const maxTime = Math.max(...timeDifferences);
      // // Here's the problem. The state minMaxTimeInMilliseconds lives in App.tsx
      // // How do I get minMaxTimeInMilliseconds into this hook?
      // setMinMaxTimeInMilliseconds({ min: minTime, max: maxTime });

      setAllComplaints(dataWithTimeDifference);
      localStorage.setItem('complaints', JSON.stringify(dataWithLatLong));
      localStorage.setItem('lastFetch', new Date().toISOString());
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
        console.error(`Error during fetch: ${error.message}`);
      } else {
        setError('An unknown error occurred');
        console.error('An unknown error occurred');
      }
    } finally {
      // stop loading spinner & no loading message
      setLoading(false, '');
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
  }, [fetchData]);

  return { allComplaints, error };
};

export default useFetchComplaints;
