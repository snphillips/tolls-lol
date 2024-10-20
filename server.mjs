const PORT = 8000;
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import 'dotenv/config';
const app = express();
app.use(express.json());
app.use(cors());
import { storeDataInS3 } from './storeDataInS3.mjs';

async function fetchAndStoreData() {
  // const limit = 1000;
  const limit = 2; // Only fetch 5 records for testing
  let offset = 0;
  let allData = [];
  let totalFetched;

  do {
    const query = `
    SELECT
      unique_key, created_date, incident_address,
      status, latitude, longitude
    WHERE
      caseless_one_of(complaint_type, 'Illegal Parking') AND
      caseless_one_of(descriptor, 'License Plate Obscured') AND
      created_date > '2024-09-20T00:00:00' :: floating_timestamp
    ORDER BY created_date DESC NULL FIRST
    LIMIT ${limit} OFFSET ${offset}
  `;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://data.cityofnewyork.us/resource/erm2-nwe9.json?$query=${encodedQuery}`;
    const response = await axios.get(url);
    const data = response.data;
    allData = [...allData, ...data];
    totalFetched = data.length;
    offset += totalFetched;
  } while (totalFetched === limit);

  // Generate a filename with the current date
  const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const fileName = `complaints-${currentDate}.json`;

  // Store data to S3 bucket with the generated filename
  await storeDataInS3(allData, fileName);

  return allData;
}

app.get('/complaints', async (req, res) => {
  try {
    const data = await fetchAndStoreData(); // function to fetch and store data
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log('Your server is running on PORT ' + PORT));
