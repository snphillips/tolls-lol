import { S3Client } from '@aws-sdk/client-s3';
import 'dotenv/config';

const client = new S3Client({ region: process.env.AWS_S3_BUCKET_REGION });

export async function storeDataInS3(data, fileName) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName, // Use the provided file name
    Body: JSON.stringify(data),
    ContentType: 'application/json',
  };

  try {
    await client.putObject(params).promise();
    console.log('💃 Data successfully stored in S3.');
  } catch (error) {
    console.error('🫠 Error storing data in S3:', error);
    throw error;
  }
}
