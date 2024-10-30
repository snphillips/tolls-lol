import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import https from 'https';

// Initialize clients
const s3 = new S3Client({ region: process.env.AWS_REGION });
const ses = new SESClient({ region: process.env.AWS_REGION });

export async function handler() {
  const endpointUrl = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json';
  const s3BucketName = process.env.AWS_S3_BUCKET_NAME;
  const s3Key = process.env.AWS_S3_FILE_NAME;
  const batchSize = 1000;
  let offset = 0;
  let allData = [];
  let hasMoreData = true;

  try {
    // Fetch data in batches using do...while
    do {
      const query = buildQuery(batchSize, offset);
      const dataBatch = await fetchData(endpointUrl, query);

      if (dataBatch.length === 0) {
        hasMoreData = false; // Stop when no more data is returned
      } else {
        allData = allData.concat(dataBatch);
        offset += batchSize;
      }
    } while (hasMoreData);

    // Save the aggregated data to S3
    const params = {
      Bucket: s3BucketName,
      Key: s3Key,
      Body: JSON.stringify(allData),
      ContentType: 'application/json',
    };

    await s3.send(new PutObjectCommand(params));

    // Send email notification using SES
    await sendEmailNotification(allData.length);

    return {
      statusCode: 200,
      body: `Data successfully saved to S3 as ${s3Key}`,
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: `Failed to save data: ${err.message}`,
    };
  }
}

// Helper function to build the SQL-like query for each batch
function buildQuery(limit, offset) {
  return `
    SELECT
      unique_key, created_date, incident_address,
      status, latitude, longitude
    WHERE
      caseless_one_of(complaint_type, 'Illegal Parking') AND
      caseless_one_of(descriptor, 'License Plate Obscured') AND
      created_date > '2024-01-01T00:00:00' :: floating_timestamp
    ORDER BY created_date DESC NULL FIRST
    LIMIT ${limit} OFFSET ${offset}
  `;
}

// Helper function to fetch data from the endpoint
function fetchData(url, query) {
  return new Promise((resolve, reject) => {
    const requestUrl = `${url}?$query=${encodeURIComponent(query)}`;

    https
      .get(requestUrl, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (err) {
            console.error(`Failed to parse JSON: ${err.message}`);
            reject(`Failed to parse JSON: ${err.message}`);
          }
        });
      })
      .on('error', (err) => {
        console.error(`Request error: ${err.message}`);
        reject(`Request error: ${err.message}`);
      });
  });
}

// Helper function to send an email using SES
async function sendEmailNotification(totalRecords) {
  const emailParams = {
    Source: process.env.EMAIL_ADDRESS,
    Destination: {
      ToAddresses: [process.env.EMAIL_ADDRESS],
    },
    Message: {
      Subject: {
        Data: 'Obscured License Plate Complaint Data Retrieved',
      },
      Body: {
        Text: {
          Data: `Total complaints retrieved: ${totalRecords}`,
        },
      },
    },
  };

  await ses.send(new SendEmailCommand(emailParams));
}
